import type { IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../../../shared/operation-result';
import {
	executeGoogleCloudStorageObject,
	googleCloudStorageObjectEntityOption,
	googleCloudStorageObjectProperties,
} from './object/google-cloud-storage-object';

export const googleCloudStorageModuleOption: INodePropertyOptions = {
	name: 'Google Cloud Storage',
	value: 'googleCloudStorage',
};

const googleCloudStorageEntityProperty: INodeProperties = {
	displayName: 'Entity',
	name: 'googleCloudStorageEntity',
	type: 'options',
	noDataExpression: true,
	default: 'object',
	displayOptions: {
		show: {
			gcpModule: ['googleCloudStorage'],
		},
	},
	options: [googleCloudStorageObjectEntityOption],
};

export const googleCloudStorageProperties: INodeProperties[] = [
	googleCloudStorageEntityProperty,
	...googleCloudStorageObjectProperties,
];

export async function executeGoogleCloudStorage(
	context: IExecuteFunctions,
	items: INodeExecutionData[],
	itemIndex: number,
): Promise<IOperationResult> {
	const entity = context.getNodeParameter(googleCloudStorageEntityProperty.name, itemIndex) as string;

	switch (entity) {
		case 'object':
			return await executeGoogleCloudStorageObject(context, items, itemIndex);
		default:
			throw new NodeOperationError(
				context.getNode(),
				`Unsupported Google Cloud Storage entity: ${entity}`,
				{ itemIndex },
			);
	}
}
