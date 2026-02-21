import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import { getGcsAccessToken } from './common';

export const googleCloudStorageBucketListOption: INodePropertyOptions = {
	name: 'List Buckets',
	value: 'listBuckets',
	description: 'List buckets in a project',
	action: 'List buckets',
};

const listProjectIdProperty: INodeProperties = {
	displayName: 'Project ID',
	name: 'googleCloudStorage_bucket_list_projectId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: {
		show: { resource: ['googleCloudStorageBucket'], operation: ['listBuckets'] },
	},
};

const listMaxResultsProperty: INodeProperties = {
	displayName: 'Max Results',
	name: 'googleCloudStorage_bucket_list_maxResults',
	type: 'number',
	default: 100,
	typeOptions: { minValue: 1, maxValue: 1000 },
	displayOptions: {
		show: { resource: ['googleCloudStorageBucket'], operation: ['listBuckets'] },
	},
};

export const googleCloudStorageBucketListProperties: INodeProperties[] = [
	listProjectIdProperty,
	listMaxResultsProperty,
];

export async function executeGoogleCloudStorageBucketList(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const projectId = context.getNodeParameter(listProjectIdProperty.name, itemIndex) as string;
	const maxResults = context.getNodeParameter(listMaxResultsProperty.name, itemIndex) as number;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let buckets: IDataObject;
	try {
		buckets = (await context.helpers.httpRequest({
			method: 'GET',
			url: 'https://storage.googleapis.com/storage/v1/b',
			headers: { Authorization: `Bearer ${accessToken}` },
			qs: {
				project: projectId,
				maxResults,
			},
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to list buckets: ${String(error)}`, { itemIndex });
	}

	return { json: buckets };
}
