export interface ISurveySectionSetting {
    id: number,
    name: string,
    icon: string
    position: number;
}

export const GeneralSectionName = 'General';

export const SurveySectionSettings: ISurveySectionSetting[] = [
    {
        id: 1,
        name: 'Communication',
        icon: 'comm_for_KOLS',
        position: 1,
    },
    {
        id: 2,
        name: 'Demographic',
        icon: 'demographics_new',
        position: 2,
    },
    {
        id: 3,
        name: 'Digital Search and Social Networking',
        icon: 'digital_search',
        position: 3,
    },
    {
        id: 4,
        name: GeneralSectionName,
        icon: 'other',
        position: 4,
    },
    {
        id: 5,
        name: 'Information Sources',
        icon: 'information_sources',
        position: 5,
    },
    {
        id: 6,
        name: 'Medical Advertising',
        icon: 'medical_advertising',
        position: 6,
    },
    {
        id: 7,
        name: 'Meetings',
        icon: 'med_meetings_and_conferences',
        position: 7,
    },
    {
        id: 8,
        name: 'Online/Print Resources',
        icon: 'online',
        position: 8,
    },
    {
        id: 9,
        name: 'Omnichannel',
        icon: 'omnichannel',
        position: 9,
    },
    {
        id: 10,
        name: 'Information Sources & Technology',
        icon: 'information_sources',
        position: 10,
    },
    {
        id: 11,
        name: 'Advertising Personalization',
        icon: 'users-viewfinder-solid',
        position: 11,
    },
    {
        id: 12,
        name: 'Patient Support Groups',
        icon: 'hospital-user-solid',
        position: 12,
    },
    {
        id: 13,
        name: 'Media Usage',
        icon: 'media',
        position: 13,
    },
    {
        id: 14,
        name: 'Social Determinants of Health',
        icon: 'med_meetings_and_conferences',
        position: 14,
    },
    {
        id: 15,
        name: 'Pharma Communication',
        icon: 'comm_for_KOLS',
        position: 15,
    },
    {
        id: 16,
        name: 'Demographics',
        icon: 'demographics_new',
        position: 16,
    },
    {
        id: 17,
        name: 'Medication',
        icon: 'caregiver_conditions',
        position: 17,
    }
];