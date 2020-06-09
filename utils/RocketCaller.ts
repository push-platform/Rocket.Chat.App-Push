import { IHttp, IRead } from '@rocket.chat/apps-engine/definition/accessors';

export class RocketCaller {
    public static xAuthToken = '';
    public static xUserId = '';

    public static async rocketDepartmentIdFromName(read: IRead, http: IHttp, departmentName: string): Promise<string> {

        const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');

        const departmentsResponse = await http.get(siteUrl + '/api/v1/livechat/department', {
            headers: {'X-Auth-Token': RocketCaller.xAuthToken, 'X-User-Id': RocketCaller.xUserId},
        });

        if (!departmentsResponse.content) {
            throw Error('Failed to get department Id from name');
        }

        const departments = JSON.parse(departmentsResponse.content).departments;

        const department = departments.find( (e) => e.name === departmentName );

        console.log('Department found: ', department);

        return department._id;
    }

    public static async rocketCreateVisitor(read: IRead,  http: IHttp, visitor): Promise<object> {

        const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');

        const visitorResponse = await http.post(siteUrl + '/api/v1/livechat/visitor',
            {
                headers: {'X-Auth-Token': RocketCaller.xAuthToken, 'X-User-Id': RocketCaller.xUserId},
                content: visitor,
            },
        );

        console.log('Visitor response: ', visitorResponse);

        return visitorResponse;

    }

    public static async rocketCreateRoom(read: IRead,  http: IHttp, visitorToken: string, priority?): Promise<object> {

        const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');

        // TODO: check priority field for enterprise versions
        const payload = {
            token: visitorToken,
            // priority,
        };

        const roomResponse = await http.get(siteUrl + '/api/v1/livechat/room',
            {
                headers: {'X-Auth-Token': RocketCaller.xAuthToken, 'X-User-Id': RocketCaller.xUserId},
                params: payload,
            },
        );

        console.log('Room response: ', roomResponse);

        return roomResponse;

    }
}
