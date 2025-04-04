export type APIGetGuidShipsResponse = {
  Ships: GuildShip[];
  Paths: {
    Entitlement: string;
  };
};

type GuildShip = GuildShipPrivate | GuildShipInHarbour | GuildShipAtSea;

type BaseGuildShip = {
  Id: string;
  Name: string;
  SailingState: SailingState | string;
  Type: ShipType;
  SailImage: string;
  Alignment: string;
};

type GuildShipPrivate = BaseGuildShip & {
  SailingState: SailingState.Private;
};

type GuildShipInHarbour = BaseGuildShip & {
  SailingState: SailingState.NotAtSeaAvailable;
};

export type GuildShipAtSea =
  | GuildShipSloopAtSea
  | GuildShipBrigantineAtSea
  | GuildShipGalleonAtSea;

type GuildShipSloopAtSea = BaseGuildShip & {
  Type: ShipType.Sloop;
  SailingState: SailingState.AtSeaAvailable;
  Crew?: [Crew, Crew];
};

type GuildShipBrigantineAtSea = BaseGuildShip & {
  Type: ShipType.Brigantine;
  SailingState: SailingState.AtSeaAvailable;
  Crew?: [Crew, Crew, Crew];
};

type GuildShipGalleonAtSea = BaseGuildShip & {
  Type: ShipType.Galleon;
  SailingState: SailingState.AtSeaAvailable;
  Crew?: [Crew, Crew, Crew, Crew];
};

export const enum ShipType {
  Sloop = "Sloop",
  Brigantine = "Brigantine",
  Galleon = "Galleon",
}

export const enum SailingState {
  NotAtSeaAvailable = "NotAtSeaAvailable",
  AtSeaAvailable = "AtSeaAvailable",
  Private = "Private",
}

export type Crew = {
  IsOnline: boolean;
  Gamertag: string | null;
};

export namespace GuildShip {
  export const isGuildShipPrivate = (
    ship: GuildShip,
  ): ship is GuildShipPrivate => {
    return ship.SailingState === SailingState.Private;
  };
  export const isGuildShipInHarbour = (
    ship: GuildShip,
  ): ship is GuildShipInHarbour => {
    return ship.SailingState === SailingState.NotAtSeaAvailable;
  };

  export const isGuildShipSloopAtSea = (
    ship: GuildShip,
  ): ship is GuildShipSloopAtSea => {
    return (
      ship.SailingState === SailingState.AtSeaAvailable &&
      ship.Type === ShipType.Sloop
    );
  };
  export const isGuildShipBrigantineAtSea = (
    ship: GuildShip,
  ): ship is GuildShipBrigantineAtSea => {
    return (
      ship.SailingState === SailingState.AtSeaAvailable &&
      ship.Type === ShipType.Brigantine
    );
  };
  export const isGuildShipGalleonAtSea = (
    ship: GuildShip,
  ): ship is GuildShipGalleonAtSea => {
    return (
      ship.SailingState === SailingState.AtSeaAvailable &&
      ship.Type === ShipType.Galleon
    );
  };
  export const isGuildShipAtSea = (ship: GuildShip): ship is GuildShipAtSea => {
    return (
      isGuildShipSloopAtSea(ship) ||
      isGuildShipBrigantineAtSea(ship) ||
      isGuildShipGalleonAtSea(ship)
    );
  };
}

export type APIGetShipChronicleResponse = { Feed: ShipChronicleFeedData[] };
export type ShipChronicleFeedData<DateType extends Date | string = string> = {
  CreatedAtUtc: DateType;
  Type: "ShipChronicle";
  Item: ShipChronicle;
};
export type ShipChronicle = {
  DaysAtSea: number;
  GoldEarned: number;
  ReputationEarned: number;
  EmissaryValueEarned: number;
  ShipAccolades: ShipAccolades[];
  ShipAccoladesIncreased: number;
  Gamertag: string;
  ShipName: "Dark Octavius";
};
export type ShipAccolades = {
  LocalizedTitle: ShipAccoladesTitle;
  PreviousProgress: number;
  CurrentProgress: number;
};
export type ShipAccoladesTitle =
  | ShipAccoladesTitleEn
  | ShipAccoladesTitleDe
  | ShipAccoladesTitleUnknown;
export type ShipAccoladesTitleUnknown = string;
export type ShipAccoladesTitleEn =
  | "Battles Completed (as Servants)"
  | "Buckets Bailed by Crew"
  | "Cannons Fired Aboard"
  | "Captained Ships Spotted"
  | "Days at Sea"
  | "Discovered Quests Completed"
  | "Enemies Lured By Crew"
  | "Forts of the Damned Conquered"
  | "Ghost Ships Vanquished"
  | "Gold Earned"
  | "Gold Earned From Hourglass Value (as Servants)"
  | "Guardians of Fortune Ships Sunk"
  | "Islands Visited"
  | "Minutes Spent Playing Shanties Aboard"
  | "Minutes Spent in Storms"
  | "Minutes Spent on Fire"
  | "Provisions Cooked Aboard"
  | "Provisions Eaten Aboard"
  | "Provisions Sold to the Hunter's Call"
  | "Repairs Made by Crew"
  | "Rowboats Docked Aboard"
  | "Sea Forts Conquered"
  | "Skeleton Camps Conquered"
  | "Skeleton Lords Vanquished"
  | "Skeletons Vanquished By Crew"
  | "Splashtails Caught"
  | "Times Damaged"
  | "Treasures Sold to The Gold Hoarders"
  | "Treasures Sold to The Reaper's Bones"
  | "Voyage Quests Completed";

export type ShipAccoladesTitleDe = "";

/*

https://www.seaofthieves.com/api/profilev2/ship-chronicle?guild=ad449ba1-b2e5-4ac0-9ec7-cc6131142c22&ship=9c527cc0-4d00-48dc-9618-0fddf2d20d5d

{
    "Feed": [
        {
            "CreatedAtUtc": "2024-11-14T00:17:48Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 1,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Nicht Zoey",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-11-02T22:13:37Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 1,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Vambey26",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-31T17:59:42Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 3,
                "GoldEarned": 40000,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Skeleton Camps Conquered
                        ",
                        "PreviousProgress": 3,
                        "CurrentProgress": 4
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 179,
                        "CurrentProgress": 180
                    },
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 204,
                        "CurrentProgress": 205
                    },
                    {
                        "LocalizedTitle": "Captained Ships Spotted
                        ",
                        "PreviousProgress": 37,
                        "CurrentProgress": 38
                    }
                ],
                "ShipAccoladesIncreased": 4,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-31T17:16:28Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 2,
                "GoldEarned": 7000,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 203,
                        "CurrentProgress": 204
                    },
                    {
                        "LocalizedTitle": "Skeletons Vanquished By Crew
                        ",
                        "PreviousProgress": 47,
                        "CurrentProgress": 48
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 178,
                        "CurrentProgress": 179
                    }
                ],
                "ShipAccoladesIncreased": 3,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-31T16:12:25Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 2,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-29T18:03:32Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 1,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-28T16:17:08Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 1,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-27T07:59:46Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 3,
                "GoldEarned": 839,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 202,
                        "CurrentProgress": 203
                    },
                    {
                        "LocalizedTitle": "Sea Forts Conquered
                        ",
                        "PreviousProgress": 47,
                        "CurrentProgress": 48
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 177,
                        "CurrentProgress": 178
                    }
                ],
                "ShipAccoladesIncreased": 3,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-25T10:30:28Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 4,
                "GoldEarned": 10679,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Buckets Bailed by Crew
                        ",
                        "PreviousProgress": 83,
                        "CurrentProgress": 86
                    },
                    {
                        "LocalizedTitle": "Cannons Fired Aboard
                        ",
                        "PreviousProgress": 94,
                        "CurrentProgress": 97
                    },
                    {
                        "LocalizedTitle": "Battles Completed (as Servants)
                        ",
                        "PreviousProgress": 20,
                        "CurrentProgress": 21
                    },
                    {
                        "LocalizedTitle": "Guardians of Fortune Ships Sunk
                        ",
                        "PreviousProgress": 18,
                        "CurrentProgress": 19
                    },
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 201,
                        "CurrentProgress": 202
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 176,
                        "CurrentProgress": 177
                    },
                    {
                        "LocalizedTitle": "Minutes Spent on Fire
                        ",
                        "PreviousProgress": 39,
                        "CurrentProgress": 40
                    },
                    {
                        "LocalizedTitle": "Treasures Sold to The Gold Hoarders
                        ",
                        "PreviousProgress": 23,
                        "CurrentProgress": 24
                    },
                    {
                        "LocalizedTitle": "Gold Earned From Hourglass Value (as Servants)
                        ",
                        "PreviousProgress": 15,
                        "CurrentProgress": 16
                    },
                    {
                        "LocalizedTitle": "Repairs Made by Crew
                        ",
                        "PreviousProgress": 80,
                        "CurrentProgress": 81
                    }
                ],
                "ShipAccoladesIncreased": 12,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        },
        {
            "CreatedAtUtc": "2024-10-24T08:24:48Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 6,
                "GoldEarned": 6572,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Enemies Lured By Crew
                        ",
                        "PreviousProgress": 0,
                        "CurrentProgress": 4
                    },
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 199,
                        "CurrentProgress": 201
                    },
                    {
                        "LocalizedTitle": "Discovered Quests Completed
                        ",
                        "PreviousProgress": 11,
                        "CurrentProgress": 12
                    },
                    {
                        "LocalizedTitle": "Minutes Spent in Storms
                        ",
                        "PreviousProgress": 36,
                        "CurrentProgress": 37
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 175,
                        "CurrentProgress": 176
                    },
                    {
                        "LocalizedTitle": "Skeleton Lords Vanquished
                        ",
                        "PreviousProgress": 8,
                        "CurrentProgress": 9
                    },
                    {
                        "LocalizedTitle": "Forts of the Damned Conquered
                        ",
                        "PreviousProgress": 19,
                        "CurrentProgress": 20
                    },
                    {
                        "LocalizedTitle": "Skeletons Vanquished By Crew
                        ",
                        "PreviousProgress": 46,
                        "CurrentProgress": 47
                    },
                    {
                        "LocalizedTitle": "Times Damaged
                        ",
                        "PreviousProgress": 69,
                        "CurrentProgress": 70
                    }
                ],
                "ShipAccoladesIncreased": 9,
                "Gamertag": "Dark883948",
                "ShipName": "Dark Octavius"
            }
        }
    ]
}



https://www.seaofthieves.com/api/profilev2/guild-chronicle?guild=ad449ba1-b2e5-4ac0-9ec7-cc6131142c22

{
    "Feed": [
        {
            "CreatedAtUtc": "2025-03-16T19:45:14Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 2,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 40,
                        "CurrentProgress": 41
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 38,
                        "CurrentProgress": 39
                    }
                ],
                "ShipAccoladesIncreased": 2,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-16T17:32:48Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 13,
                "GoldEarned": 215853,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 28,
                        "CurrentProgress": 40
                    },
                    {
                        "LocalizedTitle": "Cannons Fired Aboard
                        ",
                        "PreviousProgress": 14,
                        "CurrentProgress": 24
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 29,
                        "CurrentProgress": 38
                    },
                    {
                        "LocalizedTitle": "Repairs Made by Crew
                        ",
                        "PreviousProgress": 8,
                        "CurrentProgress": 15
                    },
                    {
                        "LocalizedTitle": "Gold Earned
                        ",
                        "PreviousProgress": 18,
                        "CurrentProgress": 24
                    },
                    {
                        "LocalizedTitle": "Treasures Sold to The Reaper's Bones
                        ",
                        "PreviousProgress": 2,
                        "CurrentProgress": 7
                    },
                    {
                        "LocalizedTitle": "Ghost Ships Vanquished
                        ",
                        "PreviousProgress": 0,
                        "CurrentProgress": 5
                    },
                    {
                        "LocalizedTitle": "Provisions Cooked Aboard
                        ",
                        "PreviousProgress": 14,
                        "CurrentProgress": 19
                    },
                    {
                        "LocalizedTitle": "Buckets Bailed by Crew
                        ",
                        "PreviousProgress": 11,
                        "CurrentProgress": 15
                    },
                    {
                        "LocalizedTitle": "Minutes Spent in Storms
                        ",
                        "PreviousProgress": 3,
                        "CurrentProgress": 7
                    }
                ],
                "ShipAccoladesIncreased": 27,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-16T07:59:44Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 2,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Minutes Spent in Storms
                        ",
                        "PreviousProgress": 2,
                        "CurrentProgress": 3
                    }
                ],
                "ShipAccoladesIncreased": 1,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-16T07:45:15Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 3,
                "GoldEarned": 5273,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 27,
                        "CurrentProgress": 29
                    },
                    {
                        "LocalizedTitle": "Rowboats Docked Aboard
                        ",
                        "PreviousProgress": 0,
                        "CurrentProgress": 1
                    },
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 27,
                        "CurrentProgress": 28
                    },
                    {
                        "LocalizedTitle": "Minutes Spent in Storms
                        ",
                        "PreviousProgress": 1,
                        "CurrentProgress": 2
                    }
                ],
                "ShipAccoladesIncreased": 4,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-16T06:56:00Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 1,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-16T06:54:24Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 2,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-16T06:45:05Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 3,
                "GoldEarned": 82167,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Splashtails Caught
                        ",
                        "PreviousProgress": 0,
                        "CurrentProgress": 3
                    },
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 26,
                        "CurrentProgress": 27
                    },
                    {
                        "LocalizedTitle": "Provisions Sold to the Hunter's Call
                        ",
                        "PreviousProgress": 0,
                        "CurrentProgress": 1
                    }
                ],
                "ShipAccoladesIncreased": 3,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-15T21:49:08Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 6,
                "GoldEarned": 80344,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 201,
                        "CurrentProgress": 203
                    },
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 202,
                        "CurrentProgress": 204
                    },
                    {
                        "LocalizedTitle": "Skeleton Ships Vanquished
                        ",
                        "PreviousProgress": 16,
                        "CurrentProgress": 18
                    },
                    {
                        "LocalizedTitle": "Buckets Bailed by Crew
                        ",
                        "PreviousProgress": 34,
                        "CurrentProgress": 35
                    },
                    {
                        "LocalizedTitle": "Voyage Quests Completed
                        ",
                        "PreviousProgress": 26,
                        "CurrentProgress": 27
                    },
                    {
                        "LocalizedTitle": "Skeleton Lords Vanquished
                        ",
                        "PreviousProgress": 9,
                        "CurrentProgress": 10
                    },
                    {
                        "LocalizedTitle": "Discovered Quests Completed
                        ",
                        "PreviousProgress": 34,
                        "CurrentProgress": 35
                    }
                ],
                "ShipAccoladesIncreased": 7,
                "Gamertag": "Tomoya2875",
                "ShipName": "Loveless"
            }
        },
        {
            "CreatedAtUtc": "2025-03-14T21:40:05Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 9,
                "GoldEarned": 56105,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [
                    {
                        "LocalizedTitle": "Days at Sea
                        ",
                        "PreviousProgress": 22,
                        "CurrentProgress": 26
                    },
                    {
                        "LocalizedTitle": "Islands Visited
                        ",
                        "PreviousProgress": 23,
                        "CurrentProgress": 27
                    },
                    {
                        "LocalizedTitle": "Cannons Fired Aboard
                        ",
                        "PreviousProgress": 11,
                        "CurrentProgress": 14
                    },
                    {
                        "LocalizedTitle": "Provisions Cooked Aboard
                        ",
                        "PreviousProgress": 11,
                        "CurrentProgress": 14
                    },
                    {
                        "LocalizedTitle": "Sea Forts Conquered
                        ",
                        "PreviousProgress": 4,
                        "CurrentProgress": 6
                    },
                    {
                        "LocalizedTitle": "Minutes Spent Playing Shanties Aboard
                        ",
                        "PreviousProgress": 0,
                        "CurrentProgress": 1
                    },
                    {
                        "LocalizedTitle": "Treasures Sold to The Reaper's Bones
                        ",
                        "PreviousProgress": 1,
                        "CurrentProgress": 2
                    },
                    {
                        "LocalizedTitle": "Captained Ships Spotted
                        ",
                        "PreviousProgress": 7,
                        "CurrentProgress": 8
                    },
                    {
                        "LocalizedTitle": "Discovered Quests Completed
                        ",
                        "PreviousProgress": 4,
                        "CurrentProgress": 5
                    },
                    {
                        "LocalizedTitle": "Provisions Eaten Aboard
                        ",
                        "PreviousProgress": 5,
                        "CurrentProgress": 6
                    }
                ],
                "ShipAccoladesIncreased": 17,
                "Gamertag": "Vambey26",
                "ShipName": "The Cursed Rogue"
            }
        },
        {
            "CreatedAtUtc": "2025-03-11T14:59:34Z",
            "Type": "ShipChronicle",
            "Item": {
                "DaysAtSea": 1,
                "GoldEarned": 0,
                "ReputationEarned": 0,
                "EmissaryValueEarned": 0,
                "ShipAccolades": [],
                "ShipAccoladesIncreased": 0,
                "Gamertag": "Tomoya2875",
                "ShipName": "Loveless"
            }
        }
    ]
}

 */
