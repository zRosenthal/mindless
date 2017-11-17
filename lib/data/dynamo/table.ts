/// <reference path="../../../typings/dynogels-types/index.d.ts" />

import * as dyn from 'dynogels';
import { injectable } from 'inversify';

import { Dynamo } from './dynamo';

@injectable()
export abstract class DynamoTable<T> {
    protected abstract tableName: string;
    protected abstract definition: dyn.ModelConfiguration;
    private _model: dyn.Model;

    constructor(private dynamo: Dynamo) {
    }

    protected registerTable() {
        this._model = this.dynamo.addDefinition(this.tableName, this.definition);
        // this.dynamo.createTables();
    }

    public create(data: { [key: string]: {} }, options: dyn.CreateItemOptions = {}): Promise<T> {
        let promiseCallback = (resolve, reject) => {
            let createModelCallback: dyn.DynogelsItemCallback = (err, model) => {
                if (err) {
                    console.error('Error creating a entry on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    let m: T = this.transformToModel(model);
                    resolve(m);
                }
            }

            this._model.create(data, options, createModelCallback);
        };

        return new Promise(promiseCallback)
    }

    public getAll(): Promise<T[]> {
        let transform = (models: dyn.Document[]) => models.map(model => this.transformToModel(model));
        return this.getAllBase(transform);
    }

    public getAllRaw(): Promise<{}[]> {
        return this.getAllBase(x => x);
    }

    protected getAllBase(transform: (x: any[]) => any): Promise<any[]> {
        let promiseCallback = (resolve, reject) => {

            let callback = (err, models: dyn.DocumentCollection) => {
                if (err) {
                    console.error('Error retrieving all models on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    models = transform(models.Items);
                    resolve(models);
                }
            };

            this._model.scan().loadAll().exec(callback);
        };

        return new Promise(promiseCallback);
    }

    protected update(data: { [key: string]: {} }, options: dyn.UpdateItemOptions = {}): Promise<T> {
        let promiseCallback = (resolve, reject) => {

            let callback: dyn.DynogelsItemCallback = (err, item) => {
                if (err) {
                    console.error('Error updating item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve(this.transformToModel(item));
                }
            };

            this._model.update(data, options, callback);
        }
        return new Promise(promiseCallback);
    }

    protected delete(hashKey: string, rangeKey?: string, options: dyn.DestroyItemOptions = {}): Promise<T> {
        let promiseCallback = (resolve, reject) => {

            let callback: dyn.DynogelsItemCallback = (err, item) => {
                if (err) {
                    console.error('Error updating item on ' + this.tableName + ' table. Err: ', err);
                    reject(err);
                } else {
                    resolve(this.transformToModel(item));
                }
            };

            if (rangeKey == null) {
                this._model.destroy(hashKey, options, callback);
            }
            else {
                this._model.destroy(hashKey, rangeKey, options, callback);
            }
        }
        return new Promise(promiseCallback);
    }

    protected abstract transformToModel(createdModel: any): T;
}