import { createServerOnlyFn } from "@tanstack/react-start";
import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

const endpointURL = process.env.AWS_ENDPOINT_URL_S3;
const bucket = "images";
const publicBaseUrl = endpointURL ? `${endpointURL}/${bucket}` : undefined;

if (!endpointURL) {
	throw new Error(
		"Missing AWS_ENDPOINT_URL_S3 environment variable. Please set it to your S3 endpoint URL.",
	);
}

const files = new Files({
	adapter: neon({
		bucket: "images",
		// endpoint defaults to AWS_ENDPOINT_URL_S3
		// region defaults to AWS_REGION (then NEON_STORAGE_REGION, then us-east-1)
		// accessKeyId / secretAccessKey resolve from the AWS credential chain
		// (the AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY Neon injects);
		// pass both or neither - passing only one throws
		publicBaseUrl: publicBaseUrl,
	}),
});

export const fetchImageWithKey = createServerOnlyFn(async (key?: string) => {
	if (!key) return null;
	const file = files.file(key);
	return await file.url();
});
