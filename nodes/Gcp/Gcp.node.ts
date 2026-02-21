import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow'
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow'
import type { IOperationResult } from '../shared/operation-result'
import {
	executeGoogleCloudStorageBucket,
	googleCloudStorageBucketOption,
	googleCloudStorageBucketProperties,
} from './resources/googleCloudStorageBucket/google-cloud-storage-bucket'
import {
	executeGoogleCloudStorageObject,
	googleCloudStorageObjectOption,
	googleCloudStorageObjectProperties,
} from './resources/googleCloudStorageObject/google-cloud-storage-object'

const resourceProperty: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'googleCloudStorageObject',
	options: [
		googleCloudStorageObjectOption,
		googleCloudStorageBucketOption,
	],
}

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
		properties: [
			resourceProperty,
			...googleCloudStorageObjectProperties,
			...googleCloudStorageBucketProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		const outputItems: INodeExecutionData[] = []
		const iterations = items.length > 0 ? items.length : 1

		for (let itemIndex = 0; itemIndex < iterations; itemIndex++) {
			try {
				const selectedModule = this.getNodeParameter(resourceProperty.name, itemIndex) as string
				let result: IOperationResult

				switch (selectedModule) {
					case 'googleCloudStorageObject':
						result = await executeGoogleCloudStorageObject(this, items, itemIndex)
						break
					case 'googleCloudStorageBucket':
						result = await executeGoogleCloudStorageBucket(this, items, itemIndex)
						break
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported GCP module: ${selectedModule}`,
							{ itemIndex },
						)
				}

				outputItems.push({
					json: result.json,
					binary: result.binary,
					pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
				})
			} catch (error) {
				if (this.continueOnFail()) {
					outputItems.push({
						json: items[itemIndex]?.json ?? {},
						error,
						pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
					})
				} else {
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					})
				}
			}
		}

		return [outputItems]
	}
}
