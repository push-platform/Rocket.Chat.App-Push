import { ApiEndpoint, IApiResponse, IApiRequest, IApiEndpointInfo } from "@rocket.chat/apps-engine/definition/api";
import { IRead, IModify, IHttp, IPersistence, HttpStatusCode } from "@rocket.chat/apps-engine/definition/accessors";
import { RocketCaller } from "../utils/RocketCaller";
import { RapidproCaller } from "../utils/RapidproCaller";
import { IApiResponseJSON } from "@rocket.chat/apps-engine/definition/api/IResponse";

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
    ) : Promise<IApiResponseJSON> {

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
        console.log("Before set: ", RocketCaller.site_url)
        RocketCaller.site_url = await read.getEnvironmentReader().getServerSettings().getValueById("Site_Url")
        console.log("After set: ", RocketCaller.site_url)
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
                let newField = {key: key, value: params[key], overwrite: true}
                customFields.push(newField);
            }
        })
        
        visitor["customFields"] = []
        customFields.map(e => {
            visitor["customFields"].push(e)
            // Object.assign(visitor["customFields"], e);
        })

        return {visitor: visitor};
    }

    public async createRoom(read : IRead, http : IHttp, visitor, priority, department_name, contact_uuid, msgs_after?) : Promise<IApiResponseJSON> {

        const key = CACHE_KEY_ROOM_ID.concat(contact_uuid)

        if(department_name) {
            const department_id = await RocketCaller.rocketDepartmentIdFromName(http, department_name);
            visitor.visitor["department"] = department_id;
        }

        const token = visitor.visitor.token;
        const createdVisitor = await RocketCaller.rocketCreateVisitor(http, visitor)
        const createdRoom = await RocketCaller.rocketCreateRoom(http, token, priority)
        const after = msgs_after ? msgs_after : this.getNowDate()  
        const logMessage = await RapidproCaller.rapidGetLogMessages(read, http, contact_uuid, after)

        if(createdVisitor.statusCode !== 200) {

        } else if(createdRoom.statusCode !== 200) {

        }

        const room = createdRoom.data.room

        if(logMessage) {
            const roomId = room._id
            RocketCaller.rocketCreateVisitorMessage(http, token, roomId, logMessage)
        }

        const roomResponse : IApiResponseJSON = {
            status: HttpStatusCode.OK,
            content: createdRoom.data
        }
        
        return roomResponse
    }

    public getNowDate() : string {
        let date = new Date();
        let now = date.toJSON().slice(0, 10)
        return now.concat("T00:00:00")
    }


}