import { Org, Page, User } from "../../api/types";
import { GroupOrg, IndividualOrg } from "../../api/types/orgAndUser";

export const me: User = {
  id: 100012,
  avatar_url: "https://cdn.muckrock.com/media/avatars/20140211-0O1A7147-2.jpg",
  feature_level: 2,
  is_staff: true,
  name: "Chris Amico",
  organization: {
    id: 125,
    avatar_url: "https://cdn.muckrock.com/media/org_avatars/logo.png",
    individual: false,
    name: "MuckRock",
    slug: "muckrock",
    uuid: "97109cc6-e52e-41e7-adb7-834ab7c6819c",
    monthly_credits: 7083,
    purchased_credits: 0,
    credit_reset_date: "2023-12-16",
    monthly_credit_allowance: 10000,
    plan: "Organization",
  },
  organizations: [19198, 170, 125],
  admin_organizations: [19198, 170],
  username: "chrisamico",
  uuid: "800bbb85-ea7a-46e9-8f56-16f862e66e52",
  verified_journalist: true,
};

export const usersList: Page<User> = {
  count: 20,
  next: null,
  previous: null,
  results: [
    {
      id: 7143,
      avatar_url: "",
      name: "Bob Makin",
      organization: 10010,
      organizations: [10010],
      admin_organizations: [10010],
      username: "BobMakin",
      uuid: "dc69fb57-cfe1-458f-b85f-63bccbe39a5f",
      verified_journalist: true,
    },
    {
      id: 100004,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Cameron Garrison",
      organization: 10015,
      organizations: [10015],
      admin_organizations: [10015],
      username: "cgarrison98",
      uuid: "14b04f35-f8cb-4c3f-82ea-890343ae85d3",
      verified_journalist: true,
    },
    {
      id: 100012,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Chris Amico",
      organization: 10023,
      organizations: [10023, 1],
      admin_organizations: [10023],
      username: "chrisamico",
      uuid: "d60a86e6-eba6-4af9-80a4-97c9ceef68d6",
      verified_journalist: true,
    },
    {
      id: 5493,
      avatar_url: "",
      name: "Colleen Kimmett",
      organization: 10003,
      organizations: [10003],
      admin_organizations: [10003],
      username: "ColleenKimmett",
      uuid: "e19a58c9-342f-48df-9cd6-bdbab8da7bf3",
      verified_journalist: true,
    },
    {
      id: 11527,
      avatar_url: "",
      name: "David Ball",
      organization: 10011,
      organizations: [10011],
      admin_organizations: [10011],
      username: "DavidBall",
      uuid: "9c33925d-8aa9-46c7-b11b-179d10707e9c",
      verified_journalist: true,
    },
    {
      id: 2,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Dylan Freedman",
      organization: 3,
      organizations: [3, 1],
      admin_organizations: [3],
      username: "freedmand",
      uuid: "0aa27e3b-c5d8-4a9d-a278-753a770f86d7",
      verified_journalist: true,
    },
    {
      id: 100013,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "FreeUser",
      organization: 10024,
      organizations: [10024],
      admin_organizations: [10024],
      username: "Freeuser",
      uuid: "1c8ea72e-6c3a-413a-858f-8f550e69f942",
      verified_journalist: true,
    },
    {
      id: 3896,
      avatar_url: "",
      name: "Geoff D'Auria",
      organization: 10004,
      organizations: [10004],
      admin_organizations: [10004],
      username: "GeoffDAuria",
      uuid: "c3efe427-0b01-443e-b5fd-d1bc9a164773",
      verified_journalist: true,
    },
    {
      id: 100010,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/media/avatars/ABS.jpg",
      name: "ja-test",
      organization: 10021,
      organizations: [10021, 1],
      admin_organizations: [10021],
      username: "ja22",
      uuid: "78756937-b6d9-40ee-b1ac-03c134416de6",
      verified_journalist: true,
    },
    {
      id: 11528,
      avatar_url: "",
      name: "Jane Armstrong",
      organization: 10012,
      organizations: [10012],
      admin_organizations: [10012],
      username: "JaneArmstrong",
      uuid: "83c988bc-37e7-4281-8e27-71d10c9bef39",
      verified_journalist: true,
    },
    {
      id: 100008,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Jim",
      organization: 10019,
      organizations: [10019],
      admin_organizations: [10019],
      username: "jimkang",
      uuid: "07641232-7dc3-4f48-9166-cae259c39fca",
      verified_journalist: true,
    },
    {
      id: 5496,
      avatar_url: "",
      name: "Katie Hyslop",
      organization: 10009,
      organizations: [10009],
      admin_organizations: [10009],
      username: "KatieHyslop",
      uuid: "db112e0a-445f-4cf1-86b3-edf1ada01710",
      verified_journalist: true,
    },
    {
      id: 100009,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Miranda Carruth",
      organization: 10020,
      organizations: [10020],
      admin_organizations: [10020],
      username: "mcarruth",
      uuid: "d1d8376b-de78-434c-a311-659b98b57d2d",
      verified_journalist: true,
    },
    {
      id: 1,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/media/account_images/22_MuckRock_2018_PRELIMANRY_EDITS_DSC_5387_2018_Derek_Kouyoumjian_preview_SfuGGnJ.jpg",
      name: "Mitchell J Kotler",
      organization: 1,
      organizations: [10028, 10027, 2, 1],
      admin_organizations: [10028, 10027, 2, 1],
      username: "mitch",
      uuid: "76742194-b998-4ca5-a7af-fd054de89e88",
      verified_journalist: true,
    },
    {
      id: 3,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/media/account_images/Screenshot_2016-11-16_15.43.27.png",
      name: "Michael Morisy",
      organization: 1,
      organizations: [7, 9, 1, 6, 4, 8, 5],
      admin_organizations: [7, 9, 1, 6, 4, 8, 5],
      username: "morisy",
      uuid: "a7579bae-6e11-4ef0-8d65-e60288fba420",
      verified_journalist: true,
    },
    {
      id: 100001,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Muckrock Staff",
      organization: 1,
      organizations: [1, 10002],
      admin_organizations: [10002],
      username: "MuckrockStaff",
      uuid: "0cbb557a-344e-4da7-9d4c-b9bf8e0a899a",
      verified_journalist: true,
    },
    {
      id: 5484,
      avatar_url: "",
      name: "Phillip Smith",
      organization: 10005,
      organizations: [10005],
      admin_organizations: [10005],
      username: "PhillipSmith",
      uuid: "f37c7e95-c9f2-473b-aff9-190d31c70209",
      verified_journalist: true,
    },
    {
      id: 5492,
      avatar_url: "",
      name: "Robyn Smith",
      organization: 10007,
      organizations: [10007],
      admin_organizations: [10007],
      username: "RobynSmith",
      uuid: "25dbed0d-0415-430c-a152-1829c164c75a",
      verified_journalist: true,
    },
    {
      id: 100011,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Test Bot",
      organization: 10022,
      organizations: [10022],
      admin_organizations: [10022],
      username: "testbot",
      uuid: "2c4dc557-4714-471d-a6ef-9fc3741c7c83",
      verified_journalist: true,
    },
    {
      id: 100003,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/profile.png",
      name: "Thad STAGING",
      organization: 10014,
      organizations: [10014],
      admin_organizations: [10014],
      username: "thad",
      uuid: "7033ef51-2997-4e54-98ce-0fcfeb050404",
      verified_journalist: true,
    },
  ],
};

export const organizationsList: Page<Org> = {
  count: 11,
  next: null,
  previous: null,
  results: [
    {
      id: 10028,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Allan Test",
      slug: "allan-test",
      uuid: "0f3eeebd-217c-4591-8120-dae9a9b038c3",
    },
    {
      id: 10000,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Free Movement",
      slug: "free-movement",
      uuid: "c1a468de-512c-4c59-ae43-84403d90a625",
    },
    {
      id: 7,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Grand Valley State University",
      slug: "grand-valley-state-university",
      uuid: "3f96395d-b6f2-45a3-8556-4600284f1cab",
    },
    {
      id: 10027,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Max User Test",
      slug: "max-user-test",
      uuid: "c0075021-0c21-4f12-b7a4-734190755252",
    },
    {
      id: 1,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/media/org_avatars/logo_uEHCMva.png",
      individual: false,
      name: "MuckRock",
      slug: "muckrock",
      uuid: "026530fc-df3a-4625-8317-c58965b9e383",
    },
    {
      id: 12,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Outlier Media",
      slug: "outlier-media",
      uuid: "e88f8b90-28e9-4951-b95f-635323fd1507",
    },
    {
      id: 6,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Society of Professional Journalists",
      slug: "society-of-professional-journalists",
      uuid: "e6dff932-2028-4fd9-9b1c-b629599a8809",
    },
    {
      id: 4,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Sunshine Week",
      slug: "sunshine-week",
      uuid: "d31f9c1f-db18-4f21-8bd4-47fe75488412",
    },
    {
      id: 8,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "test",
      slug: "test",
      uuid: "9de30508-add8-45db-a6c5-399f566eeaec",
    },
    {
      id: 545,
      avatar_url: "",
      individual: false,
      name: "The Tyee",
      slug: "thetyee",
      uuid: "03ffe120-4037-4014-ab83-6521b9a3270b",
    },
    {
      id: 5,
      avatar_url:
        "https://squarelet-staging.s3.amazonaws.com/static/images/avatars/organization.png",
      individual: false,
      name: "Wesleyan Journalism",
      slug: "wesleyan-journalism",
      uuid: "a74a999c-4e1c-4056-8273-08dd639101fc",
    },
  ],
};

export const organization: GroupOrg = {
  uuid: "",
  id: 1,
  avatar_url:
    "https://squarelet-staging.s3.amazonaws.com/media/org_avatars/logo_uEHCMva.png",
  individual: false,
  name: "MuckRock",
  slug: "muckrock",
  monthly_credits: 5000,
  purchased_credits: 0,
  credit_reset_date: "2023-11-28",
  monthly_credit_allowance: 5000,
  plan: "Organization",
};

export const proOrg: IndividualOrg = {
  uuid: "",
  id: 4,
  avatar_url:
    "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
  individual: true,
  name: "lasser.allan",
  slug: "lasserallan",
  monthly_credits: 2500,
  purchased_credits: 3000,
  credit_reset_date: "2023-11-28",
  monthly_credit_allowance: 2500,
  plan: "Professional",
};

export const freeOrg: IndividualOrg = {
  uuid: "",
  id: 4,
  avatar_url:
    "https://cdn.muckrock.com/media/account_images/allan-headshot-2016.jpg",
  individual: true,
  name: "lasser.allan",
  slug: "lasserallan",
  monthly_credits: 0,
  purchased_credits: 0,
  credit_reset_date: "2023-11-28",
  monthly_credit_allowance: 0,
  plan: "Free",
};