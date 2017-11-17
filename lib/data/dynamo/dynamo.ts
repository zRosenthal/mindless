import { MINDLESS_SERVICE_INDENTIFIERS } from '../../types';
import { MindlessConfig } from '../../configs';
import * as dyn from 'dynogels';
import { injectable, inject } from 'inversify';

import { DynamoTable } from './table';

@injectable()
export class Dynamo {

    constructor( @inject(MINDLESS_SERVICE_INDENTIFIERS.MindlessConfig) private config: MindlessConfig) {
        dyn.AWS.config.update({ region: "us-east-1", accessKeyId: "abcd", secretAccessKey: "secret" });
        const opts = { endpoint: config.dynamoEndpoint }
        console.log(config);
        dyn.dynamoDriver(new dyn.AWS.DynamoDB(opts));
    }

    public addDefinition(tableName: string, tableDefnition: dyn.ModelConfiguration) {
        return dyn.define(tableName, tableDefnition);
    }

    public createTables() {
        dyn.createTables((err) => {
            if (err) {
                console.log('Dynamo error creating tables: ', err);
            } else {
                console.log('successfully created tables');
            }
        })
    }
}