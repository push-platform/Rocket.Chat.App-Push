import { ApiEndpoint, IApiResponse, IApiRequest, IApiEndpointInfo } from "@rocket.chat/apps-engine/definition/api";
import { IRead, IModify, IHttp, IPersistence } from "@rocket.chat/apps-engine/definition/accessors";
import { isRegExp } from "util";
import { RocketCaller } from "../utils/RocketCaller";

const CACHE_KEY_ROOM_ID = "room_contact_uuid_"

export class PushEndpoint extends ApiEndpoint {
    public path = "push/webhook";   
    
    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead, 
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ) : Promise<IApiResponse> {

        const org_id = request.query.orgId;
        const department_name = request.query.department;
        let contact_uuid = request.query.contactUuid;
        const priority = request.params.priority;
        const visitor = this.getVisitorFromParams(request.query);
        if (!contact_uuid) {
            contact_uuid = request.query.token;
        }
        
        RocketCaller.x_auth_token = request.headers["x-auth-token"]
        RocketCaller.x_user_id = request.headers["x-user-id"]
        // console.log("Request Auth-Token and User-Id: ", request.headers["x-auth-token"], request.headers["x-user-id"])
        
        const newRoom = await this.createRoom(read, http,visitor, priority, department_name, contact_uuid);

        return newRoom

        // return this.success();
    }

    public getVisitorFromParams(params: object): object {
        let visitor : object = {}
        const customFields : object[] = [];

        Object.keys(params).map( (key, index) => {
            if( ['name', 'email', 'token', 'phone'].includes(key) ) {
                visitor[key] = params[key];
            } else {
                let newField = {key: key, value: params[key]}
                customFields.push(newField);
            }
        })
        
        visitor["customFields"] = {}
        customFields.map(e => {
            Object.assign(visitor["customFields"], e);
        })

        return {visitor: visitor};
    }

    public async createRoom(read : IRead, http : IHttp, visitor, priority, department_name, contact_uuid, msgs_after?) : Promise<IApiResponse> {
        const key = CACHE_KEY_ROOM_ID.concat(contact_uuid)
        // TODO: use Cache to store and get rooms 
        if(department_name) {
            const department_id = await RocketCaller.rocketDepartmentIdFromName(read, http, department_name);
            visitor.visitor["department"] = department_id;
        }

        const token = visitor.visitor.token;
        const createdVisitor = RocketCaller.rocketCreateVisitor(read, http, visitor)
        const createdRoom = RocketCaller.rocketCreateRoom(read, http, token, priority)
        const after = msgs_after ? msgs_after : this.getNowDate()
        console.log("Now date: ", after)




        return this.success();
    }

    public getNowDate() : string {
        let date = new Date();
        let now = date.toJSON().slice(0, 10)
        return now.concat(" 00:00:00+00:00")
    }


}