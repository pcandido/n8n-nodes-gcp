import type { IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { getGcsAccessToken } from './common';

export const googleCloudStorageBucketDeleteOption: INodePropertyOptions = {
	name: 'Delete Bucket',
	value: 'deleteBucket',
	description: 'Delete a bucket',
	action: 'Delete bucket',
};

const deleteBucketNameProperty: INodeProperties = {
	displayName: 'Bucket Name',
	name: 'googleCloudStorage_bucket_delete_name',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: { resource: ['googleCloudStorageBucket'], operation: ['deleteBucket'] },
	},
};

export const googleCloudStorageBucketDeleteProperties: INodeProperties[] = [deleteBucketNameProperty];

export async function executeGoogleCloudStorageBucketDelete(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucketName = context.getNodeParameter(deleteBucketNameProperty.name, itemIndex) as string;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	try {
		await context.helpers.httpRequest({
			method: 'DELETE',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}`,
			headers: { Authorization: `Bearer ${accessToken}` },
			json: true,
		});
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to delete bucket: ${String(error)}`, { itemIndex });
	}

	return { json: { bucket: bucketName, deleted: true } };
}
