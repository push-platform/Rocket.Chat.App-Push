import { IHttp, IRead } from '@rocket.chat/apps-engine/definition/accessors';

export class RocketCaller {
    public static xAuthToken = '';
    public static xUserId = '';
    public static DEPARTMENT_API_PATH = '/api/v1/livechat/department';
    public static VISITOR_API_PATH = '/api/v1/livechat/visitor';
    public static ROOM_API_PATH = '/api/v1/livechat/room';

    public static async departmentIdFromName(read: IRead, http: IHttp, departmentName: string): Promise<string | null> {

        const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');

        const departmentsResponse = await http.get(siteUrl + this.DEPARTMENT_API_PATH, {
            headers: {'X-Auth-Token': RocketCaller.xAuthToken, 'X-User-Id': RocketCaller.xUserId},
        });

        if (!departmentsResponse.content) {
            throw Error('Failed to get department Id from name');
        }

        const departments = JSON.parse(departmentsResponse.content).departments;

        const department = departments.find( (e) => e.name === departmentName );

        if (!department) {
            return null;
        }

        console.log('Department found: ', department);

        return department._id;
    }

    public static async createVisitor(read: IRead,  http: IHttp, visitor): Promise<object | null> {

        const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');

        const visitorResponse = await http.post(siteUrl + this.VISITOR_API_PATH,
            {
                headers: {'X-Auth-Token': RocketCaller.xAuthToken, 'X-User-Id': RocketCaller.xUserId},
                content: JSON.stringify(visitor),
            },
        );

        if (!visitorResponse) {
            return null;
        }

        console.log('Visitor response: ', visitorResponse);

        return visitorResponse;

    }

    public static async createRoom(read: IRead,  http: IHttp, visitorToken: string, priority?): Promise<object | null> {

        const siteUrl = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');

        // TODO: check priority field for enterprise versions
        const payload = {
            token: visitorToken,
            // priority,
        };

        const roomResponse = await http.get(siteUrl + this.ROOM_API_PATH,
            {
                headers: {'X-Auth-Token': RocketCaller.xAuthToken, 'X-User-Id': RocketCaller.xUserId},
                params: payload,
            },
        );

        if (!roomResponse) {
            return null;
        }

        console.log('Room response: ', roomResponse);

        return roomResponse;

    }
}
