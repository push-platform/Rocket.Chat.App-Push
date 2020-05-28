import { IRead, IHttp } from "@rocket.chat/apps-engine/definition/accessors"

export class RocketCaller {
    static x_auth_token = ""
    static x_user_id = ""

    public static async rocketDepartmentIdFromName(read : IRead, http : IHttp, department_name) : Promise<string> {

        const site_url = await read.getEnvironmentReader().getServerSettings().getValueById("Site_Url")

        const departments_response = await http.get(site_url + "/api/v1/livechat/department", {
            headers: {"X-Auth-Token": RocketCaller.x_auth_token, "X-User-Id": RocketCaller.x_user_id}
        })
        if(!departments_response.content) {
            throw Error("Failed to get department Id from name")
        }

        const departments = JSON.parse(departments_response.content).departments

        const department = departments.find( e => e.name === department_name )

        return department._id
    }

    public static async rocketCreateVisitor(read : IRead,  http : IHttp, visitor) : Promise<object> {
        
        const site_url = await read.getEnvironmentReader().getServerSettings().getValueById("Site_Url")

        const visitor_response = await http.post(site_url + "/api/v1/livechat/visitor", 
            {
                headers: {"X-Auth-Token": RocketCaller.x_auth_token, "X-User-Id": RocketCaller.x_user_id},
                content: visitor
            }
        )

        console.log("Visitor response: ", visitor_response)

        return visitor_response

    }

    public static async rocketCreateRoom(read : IRead,  http : IHttp, visitor_token, priority?) : Promise<object> {

        const site_url = await read.getEnvironmentReader().getServerSettings().getValueById("Site_Url")

        const payload = {
            token: visitor_token,
            priority: priority
        }

        const room_response = await http.get(site_url + "/api/v1/livechat/room", 
            {
                headers: {"X-Auth-Token": RocketCaller.x_auth_token, "X-User-Id": RocketCaller.x_user_id},
                params: payload
            }
        )

        console.log("Room response: ", room_response)

        return room_response
        
    }
}