import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import type { IOperationResult } from '../shared/operation-result';
import {
	executeGoogleCloudStorage,
	googleCloudStorageModuleOption,
	googleCloudStorageProperties,
} from './modules/googleCloudStorage/google-cloud-storage';

const gcpModuleProperty: INodeProperties = {
	displayName: 'Module',
	name: 'gcpModule',
	type: 'options',
	noDataExpression: true,
	default: 'googleCloudStorage',
	options: [googleCloudStorageModuleOption],
};

export class Gcp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GCP',
		name: 'gcp',
		icon: { light: 'file:Gcp.svg', dark: 'file:Gcp.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'Google Cloud Platform wrapper node',
		defaults: {
			name: 'GCP',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'gcpServiceAccountApi',
				required: true,
			},
		],
		properties: [gcpModuleProperty, ...googleCloudStorageProperties],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const outputItems: INodeExecutionData[] = [];
		const iterations = items.length > 0 ? items.length : 1;

		for (let itemIndex = 0; itemIndex < iterations; itemIndex++) {
			try {
				const selectedModule = this.getNodeParameter(gcpModuleProperty.name, itemIndex) as string;
				let result: IOperationResult;

				switch (selectedModule) {
					case 'googleCloudStorage':
						result = await executeGoogleCloudStorage(this, items, itemIndex);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported GCP module: ${selectedModule}`,
							{ itemIndex },
						);
				}

				outputItems.push({
					json: result.json,
					binary: result.binary,
					pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					outputItems.push({
						json: items[itemIndex]?.json ?? {},
						error,
						pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [outputItems];
	}
}
