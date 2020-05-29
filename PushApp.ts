import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend,
    IEnvironmentRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { Test } from './commands/Test';
import { ApiVisibility, ApiSecurity } from '@rocket.chat/apps-engine/definition/api';
import { RocketEndpoint } from './endpoints/RocketEndpoint';
import { PushEndpoint } from './endpoints/PushEndpoint';

export class PushApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);

    }

    async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {

        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [
                new RocketEndpoint(this),
                new PushEndpoint(this)
            ]
        })

        await configuration.settings.provideSetting({
            id:  "rc_ptkn",
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Rocketchat Personal Access Token',
        });

        await configuration.settings.provideSetting({
            id:  "rc_uid",
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Rocketchat User Id',
        });

        await configuration.settings.provideSetting({
            id:  "slug",
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Slug',
        });

        await configuration.settings.provideSetting({
            id:  "push_token",
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Push Token',
        });

        await configuration.settings.provideSetting({
            id:  "close_tckt_flow",
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Close Ticket Flow',
        });

        await configuration.settings.provideSetting({
            id:  "queued_token_flow",
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'Queued Token Flow',
        });
        
        await configuration.settings.provideSetting({
            id:  "taken_token_flow",
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'Taken Token Flow',
        });

        await configuration.settings.provideSetting({
            id:  "base_url",
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Base URL',
        });

        await configuration.settings.provideSetting({
            id:  "rc_crm_url",
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'RC CRM URL',
        });

        await configuration.settings.provideSetting({
            id:  "flow_media_token",
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'Flow Media Token',
        });

        configuration.slashCommands.provideSlashCommand(new Test(this))
                
    }
}
