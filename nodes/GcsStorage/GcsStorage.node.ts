import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { executeUpload, uploadOperation, uploadProperties } from './object/upload';

export class GcsStorage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GCS Storage',
		name: 'gcsStorage',
		icon: { light: 'file:GcsStorage.svg', dark: 'file:GcsStorage.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'GCS object operation wrapper',
		defaults: {
			name: 'GCS Storage',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'googleApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Entity',
				name: 'entity',
				type: 'options',
				noDataExpression: true,
				default: 'object',
				options: [
					{
						name: 'Object',
						value: 'object',
					},
				],
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'upload',
				displayOptions: {
					show: {
						entity: ['object'],
					},
				},
				options: [uploadOperation],
			},
			...uploadProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const outputItems: INodeExecutionData[] = [];
		const iterations = items.length > 0 ? items.length : 1;

		for (let itemIndex = 0; itemIndex < iterations; itemIndex++) {
			try {
				const entity = this.getNodeParameter('entity', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let payload: Record<string, unknown>;

				if (entity === 'object' && operation === 'upload') {
					payload = await executeUpload(this, items, itemIndex);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported entity/operation combination: ${entity}/${operation}`,
						{ itemIndex },
					);
				}

				outputItems.push({
					json: {
						entity,
						operation,
						payload,
					},
					binary: items[itemIndex]?.binary,
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
