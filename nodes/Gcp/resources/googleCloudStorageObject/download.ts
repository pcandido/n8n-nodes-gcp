import type { IBinaryData, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { encodeObjectName, getGcsAccessToken } from './common';

export const googleCloudStorageObjectDownloadOption: INodePropertyOptions = {
	name: 'Download',
	value: 'download',
	description: 'Download an object as binary',
	action: 'Download an object',
};

const downloadBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_download_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['download'] } },
};

const downloadFilePathProperty: INodeProperties = {
	displayName: 'File Path',
	name: 'googleCloudStorage_object_download_filePath',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['download'] } },
};

const downloadBinaryProperty: INodeProperties = {
	displayName: 'Output Binary Property',
	name: 'googleCloudStorage_object_download_binaryProperty',
	type: 'string',
	default: 'data',
	required: true,
	displayOptions: { show: { resource: ['googleCloudStorageObject'], operation: ['download'] } },
};

export const googleCloudStorageObjectDownloadProperties: INodeProperties[] = [
	downloadBucketProperty,
	downloadFilePathProperty,
	downloadBinaryProperty,
];

export async function executeGoogleCloudStorageObjectDownload(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(downloadBucketProperty.name, itemIndex) as string;
	const filePath = context.getNodeParameter(downloadFilePathProperty.name, itemIndex) as string;
	const outputBinaryProperty = context.getNodeParameter(downloadBinaryProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	const metadata = (await context.helpers.httpRequest({
		method: 'GET',
		url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(filePath)}`,
		headers: { Authorization: `Bearer ${accessToken}` },
		json: true,
	})) as { name?: string; contentType?: string; size?: string; generation?: string };

	let rawBody: unknown;
	try {
		rawBody = await context.helpers.httpRequest({
			method: 'GET',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeObjectName(filePath)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			qs: { alt: 'media' },
			json: false,
			encoding: 'arraybuffer',
		});
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to download object: ${String(error)}`, {
			itemIndex,
		});
	}

	const fileBuffer = Buffer.isBuffer(rawBody)
		? rawBody
		: rawBody instanceof ArrayBuffer
			? Buffer.from(rawBody)
			: Buffer.from(typeof rawBody === 'string' ? rawBody : String(rawBody), 'binary');
	let binaryData: IBinaryData;
	try {
		binaryData = await context.helpers.prepareBinaryData(
			fileBuffer,
			metadata.name || filePath,
			metadata.contentType || 'application/octet-stream',
		);
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to prepare binary data: ${String(error)}`, {
			itemIndex,
		});
	}

	return {
		json: {
			bucket,
			filePath,
			binaryProperty: outputBinaryProperty,
			size: metadata.size,
			mimeType: metadata.contentType,
			generation: metadata.generation,
		},
		binary: {
			[outputBinaryProperty]: binaryData,
		},
	};
}
