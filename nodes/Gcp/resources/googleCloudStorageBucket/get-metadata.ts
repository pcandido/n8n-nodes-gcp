import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { getGcsAccessToken } from './common';

export const googleCloudStorageBucketGetMetadataOption: INodePropertyOptions = {
	name: 'Get Bucket Metadata',
	value: 'getBucketMetadata',
	description: 'Retrieve metadata for a bucket',
	action: 'Get bucket metadata',
};

const getMetadataBucketNameProperty: INodeProperties = {
	displayName: 'Bucket Name',
	name: 'googleCloudStorage_bucket_getMetadata_name',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: {
			resource: ['googleCloudStorageBucket'],
			operation: ['getBucketMetadata'],
		},
	},
};

export const googleCloudStorageBucketGetMetadataProperties: INodeProperties[] = [
	getMetadataBucketNameProperty,
];

export async function executeGoogleCloudStorageBucketGetMetadata(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucketName = context.getNodeParameter(getMetadataBucketNameProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let metadata: IDataObject;
	try {
		metadata = (await context.helpers.httpRequest({
			method: 'GET',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to get bucket metadata: ${String(error)}`, {
			itemIndex,
		});
	}

	return { json: metadata };
}
