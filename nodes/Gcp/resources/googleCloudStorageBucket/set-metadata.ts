import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { ensureBucketMetadata, getGcsAccessToken } from './common';

export const googleCloudStorageBucketSetMetadataOption: INodePropertyOptions = {
	name: 'Set Bucket Metadata',
	value: 'setBucketMetadata',
	description: 'Patch bucket metadata',
	action: 'Set bucket metadata',
};

const setMetadataBucketNameProperty: INodeProperties = {
	displayName: 'Bucket Name',
	name: 'googleCloudStorage_bucket_setMetadata_name',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			resource: ['googleCloudStorageBucket'],
			operation: ['setBucketMetadata'],
		},
	},
};

const setMetadataJsonProperty: INodeProperties = {
	displayName: 'Metadata JSON',
	name: 'googleCloudStorage_bucket_setMetadata_json',
	type: 'json',
	default: '{}',
	required: true,
	displayOptions: {
		show: {
			resource: ['googleCloudStorageBucket'],
			operation: ['setBucketMetadata'],
		},
	},
	description: 'JSON object used to patch bucket metadata',
};

export const googleCloudStorageBucketSetMetadataProperties: INodeProperties[] = [
	setMetadataBucketNameProperty,
	setMetadataJsonProperty,
];

export async function executeGoogleCloudStorageBucketSetMetadata(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucketName = context.getNodeParameter(setMetadataBucketNameProperty.name, itemIndex) as string;
	const metadataValue = context.getNodeParameter(setMetadataJsonProperty.name, itemIndex) as unknown;
	const metadata = ensureBucketMetadata(metadataValue, itemIndex, context);
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let response: IDataObject;
	try {
		response = (await context.helpers.httpRequest({
			method: 'PATCH',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			body: metadata,
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to set bucket metadata: ${String(error)}`, {
			itemIndex,
		});
	}

	return { json: response };
}
