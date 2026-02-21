import type { IDataObject, IExecuteFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../../shared/operation-result';
import { getGcsAccessToken } from './common';

export const googleCloudStorageObjectListOption: INodePropertyOptions = {
	name: 'List',
	value: 'list',
	description: 'List objects in a bucket',
	action: 'List objects',
};

const listBucketProperty: INodeProperties = {
	displayName: 'Bucket',
	name: 'googleCloudStorage_object_list_bucket',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['list'] } },
};

const listPrefixProperty: INodeProperties = {
	displayName: 'Prefix',
	name: 'googleCloudStorage_object_list_prefix',
	type: 'string',
	default: '',
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['list'] } },
};

const listMaxResultsProperty: INodeProperties = {
	displayName: 'Max Results',
	name: 'googleCloudStorage_object_list_maxResults',
	type: 'number',
	default: 100,
	typeOptions: { minValue: 1, maxValue: 1000 },
	displayOptions: { show: { gcpModule: ['googleCloudStorage'], googleCloudStorageEntity: ['object'], googleCloudStorageObjectOperation: ['list'] } },
};

export const googleCloudStorageObjectListProperties: INodeProperties[] = [
	listBucketProperty,
	listPrefixProperty,
	listMaxResultsProperty,
];

export async function executeGoogleCloudStorageObjectList(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<IOperationResult> {
	const bucket = context.getNodeParameter(listBucketProperty.name, itemIndex) as string;
	const prefix = context.getNodeParameter(listPrefixProperty.name, itemIndex) as string;
	const maxResults = context.getNodeParameter(listMaxResultsProperty.name, itemIndex) as number;
	const accessToken = await getGcsAccessToken(context, itemIndex);

	let listResponse: IDataObject;
	try {
		listResponse = (await context.helpers.httpRequest({
			method: 'GET',
			url: `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o`,
			headers: { Authorization: `Bearer ${accessToken}` },
			qs: {
				prefix: prefix || undefined,
				maxResults,
			},
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(context.getNode(), `Failed to list objects: ${String(error)}`, { itemIndex });
	}

	return { json: listResponse };
}
