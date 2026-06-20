import { shopifyAdminFetch } from "@/lib/shopify";
import { isAdminScopeError } from "./phone";

export const AVATAR_METAFIELD_NAMESPACE = "custom";
export const AVATAR_METAFIELD_KEY = "avatar_url";

export const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const STAGED_UPLOADS_CREATE = `#graphql
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_CREATE = `#graphql
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        ... on MediaImage {
          image {
            url
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_URL_QUERY = `#graphql
  query FileUrl($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        fileStatus
        image {
          url
        }
      }
    }
  }
`;

const CUSTOMER_AVATAR_QUERY = `#graphql
  query CustomerAvatar($id: ID!) {
    customer(id: $id) {
      metafield(namespace: "${AVATAR_METAFIELD_NAMESPACE}", key: "${AVATAR_METAFIELD_KEY}") {
        value
      }
    }
  }
`;

const METAFIELDS_SET = `#graphql
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELDS_DELETE = `#graphql
  mutation MetafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      deletedMetafields {
        key
        namespace
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type StagedUploadsCreateResult = {
  stagedUploadsCreate?: {
    stagedTargets?: {
      url: string;
      resourceUrl: string;
      parameters: { name: string; value: string }[];
    }[];
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

type FileCreateResult = {
  fileCreate?: {
    files?: {
      id: string;
      fileStatus: string;
      image?: { url?: string | null } | null;
    }[];
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

type FileUrlResult = {
  node?: {
    fileStatus?: string;
    image?: { url?: string | null } | null;
  } | null;
};

type CustomerAvatarResult = {
  customer?: {
    metafield?: { value?: string | null } | null;
  } | null;
};

type MetafieldsSetResult = {
  metafieldsSet?: {
    metafields?: { id: string; value: string }[];
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

type MetafieldsDeleteResult = {
  metafieldsDelete?: {
    deletedMetafields?: { key: string; namespace: string }[];
    userErrors?: { field?: string[] | null; message: string }[];
  } | null;
};

export function validateAvatarFile(file: File): string | null {
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
    return "Use a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return "Image must be 5 MB or smaller.";
  }

  if (file.size === 0) {
    return "Choose an image to upload.";
  }

  return null;
}

export { getCustomerAvatarUrl } from "./display";

export async function fetchCustomerAvatarUrl(customerId: string): Promise<string | null> {
  try {
    const data = await shopifyAdminFetch<CustomerAvatarResult>(CUSTOMER_AVATAR_QUERY, {
      id: customerId,
    });

    const value = data.customer?.metafield?.value?.trim();
    return value || null;
  } catch {
    return null;
  }
}

async function uploadToStagedTarget(
  target: {
    url: string;
    parameters: { name: string; value: string }[];
  },
  fileBuffer: Buffer,
  mimeType: string,
  filename: string
): Promise<void> {
  const formData = new FormData();

  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }

  formData.append("file", new Blob([new Uint8Array(fileBuffer)], { type: mimeType }), filename);

  const response = await fetch(target.url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`File upload failed (${response.status}).`);
  }
}

async function resolveFileUrl(fileId: string, initialUrl?: string | null): Promise<string | null> {
  if (initialUrl) return initialUrl;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const data = await shopifyAdminFetch<FileUrlResult>(FILE_URL_QUERY, { id: fileId });
    const url = data.node?.image?.url;

    if (url) return url;

    if (data.node?.fileStatus === "FAILED") {
      throw new Error("Image processing failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }

  return null;
}

async function createImageAsset(
  resourceUrl: string
): Promise<{ fileId: string; url: string | null }> {
  const data = await shopifyAdminFetch<FileCreateResult>(FILE_CREATE, {
    files: [
      {
        alt: "Customer profile photo",
        contentType: "IMAGE",
        originalSource: resourceUrl,
      },
    ],
  });

  const payload = data.fileCreate;
  const userErrors = payload?.userErrors ?? [];

  if (userErrors.length) {
    throw new Error(userErrors[0]?.message ?? "Image could not be created.");
  }

  const file = payload?.files?.[0];
  if (!file?.id) {
    throw new Error("Image could not be created.");
  }

  const url = await resolveFileUrl(file.id, file.image?.url ?? null);
  return { fileId: file.id, url };
}

async function setCustomerAvatarMetafield(
  customerId: string,
  avatarUrl: string
): Promise<{ avatarUrl: string | null; errors: string[] }> {
  try {
    const data = await shopifyAdminFetch<MetafieldsSetResult>(METAFIELDS_SET, {
      metafields: [
        {
          ownerId: customerId,
          namespace: AVATAR_METAFIELD_NAMESPACE,
          key: AVATAR_METAFIELD_KEY,
          type: "url",
          value: avatarUrl,
        },
      ],
    });

    const userErrors = data.metafieldsSet?.userErrors ?? [];

    if (userErrors.length) {
      return {
        avatarUrl: null,
        errors: userErrors.map((error) => error.message),
      };
    }

    const value = data.metafieldsSet?.metafields?.[0]?.value ?? avatarUrl;
    return { avatarUrl: value, errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar could not be saved.";
    return { avatarUrl: null, errors: [message] };
  }
}

export async function uploadCustomerAvatar(
  customerId: string,
  file: File
): Promise<{ avatarUrl: string | null; errors: string[] }> {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    return { avatarUrl: null, errors: [validationError] };
  }

  try {
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `avatar-${customerId.split("/").pop()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const stagedData = await shopifyAdminFetch<StagedUploadsCreateResult>(STAGED_UPLOADS_CREATE, {
      input: [
        {
          filename,
          mimeType: file.type,
          httpMethod: "POST",
          resource: "IMAGE",
          fileSize: String(file.size),
        },
      ],
    });

    const stagedErrors = stagedData.stagedUploadsCreate?.userErrors ?? [];
    if (stagedErrors.length) {
      return {
        avatarUrl: null,
        errors: stagedErrors.map((error) => error.message),
      };
    }

    const target = stagedData.stagedUploadsCreate?.stagedTargets?.[0];
    if (!target?.resourceUrl) {
      return { avatarUrl: null, errors: ["Upload could not be started."] };
    }

    await uploadToStagedTarget(target, fileBuffer, file.type, filename);

    const { url } = await createImageAsset(target.resourceUrl);
    if (!url) {
      return { avatarUrl: null, errors: ["Image URL could not be resolved. Try again."] };
    }

    return setCustomerAvatarMetafield(customerId, url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar could not be uploaded.";

    if (isAdminScopeError(message) || message.toLowerCase().includes("write_files")) {
      return {
        avatarUrl: null,
        errors: [
          "Profile photos need the write_files Admin scope on your Shopify app. Add it in Dev Dashboard → Versions → Access, release, and reinstall the app.",
        ],
      };
    }

    return { avatarUrl: null, errors: [message] };
  }
}

export async function clearCustomerAvatar(
  customerId: string
): Promise<{ errors: string[] }> {
  try {
    const data = await shopifyAdminFetch<MetafieldsDeleteResult>(METAFIELDS_DELETE, {
      metafields: [
        {
          ownerId: customerId,
          namespace: AVATAR_METAFIELD_NAMESPACE,
          key: AVATAR_METAFIELD_KEY,
        },
      ],
    });

    const userErrors = data.metafieldsDelete?.userErrors ?? [];

    if (userErrors.length) {
      return { errors: userErrors.map((error) => error.message) };
    }

    return { errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Avatar could not be removed.";
    return { errors: [message] };
  }
}
