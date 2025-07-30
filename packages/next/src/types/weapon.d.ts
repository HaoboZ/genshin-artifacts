export type WeaponKey =
	| 'Absolution' // Absolution
	| 'AquilaFavonia' // Aquila Favonia
	| 'Azurelight' // Azurelight
	| 'FreedomSworn' // Freedom-Sworn
	| 'HaranGeppakuFutsu' // Haran Geppaku Futsu
	| 'KeyOfKhajNisut' // Key of Khaj-Nisut
	| 'LightOfFoliarIncision' // Light of Foliar Incision
	| 'MistsplitterReforged' // Mistsplitter Reforged
	| 'PeakPatrolSong' // Peak Patrol Song
	| 'PrimordialJadeCutter' // Primordial Jade Cutter
	| 'SkywardBlade' // Skyward Blade
	| 'SplendorOfTranquilWaters' // Splendor of Tranquil Waters
	| 'SummitShaper' // Summit Shaper
	| 'UrakuMisugiri' // Uraku Misugiri
	| 'AmenomaKageuchi' // Amenoma Kageuchi
	| 'BlackcliffLongsword' // Blackcliff Longsword
	| 'CalamityOfEshu' // Calamity of Eshu
	| 'CinnabarSpindle' // Cinnabar Spindle
	| 'FavoniusSword' // Favonius Sword
	| 'FesteringDesire' // Festering Desire
	| 'FinaleOfTheDeep' // Finale of the Deep
	| 'FleuveCendreFerryman' // Fleuve Cendre Ferryman
	| 'FluteOfEzpitzal' // Flute of Ezpitzal
	| 'IronSting' // Iron Sting
	| 'KagotsurubeIsshin' // Kagotsurube Isshin
	| 'LionsRoar' // Lion's Roar
	| 'PrototypeRancour' // Prototype Rancour
	| 'RoyalLongsword' // Royal Longsword
	| 'SacrificialSword' // Sacrificial Sword
	| 'SapwoodBlade' // Sapwood Blade
	| 'SturdyBone' // Sturdy Bone
	| 'SwordOfDescension' // Sword of Descension
	| 'SwordOfNarzissenkreuz' // Sword of Narzissenkreuz
	| 'TheAlleyFlash' // The Alley Flash
	| 'TheBlackSword' // The Black Sword
	| 'TheDockhandsAssistant' // The Dockhand's Assistant
	| 'TheFlute' // The Flute
	| 'ToukabouShigure' // Toukabou Shigure
	| 'WolfFang' // Wolf-Fang
	| 'XiphosMoonlight' // Xiphos' Moonlight
	| 'CoolSteel' // Cool Steel
	| 'DarkIronSword' // Dark Iron Sword
	| 'FilletBlade' // Fillet Blade
	| 'HarbingerOfDawn' // Harbinger of Dawn
	| 'SkyriderSword' // Skyrider Sword
	| 'TravelersHandySword' // Traveler's Handy Sword
	| 'SilverSword' // Silver Sword
	| 'DullBlade' // Dull Blade
	| 'AThousandBlazingSuns' // A Thousand Blazing Suns
	| 'BeaconOfTheReedSea' // Beacon of the Reed Sea
	| 'FangOfTheMountainKing' // Fang of the Mountain King
	| 'RedhornStonethresher' // Redhorn Stonethresher
	| 'SkywardPride' // Skyward Pride
	| 'SongOfBrokenPines' // Song of Broken Pines
	| 'TheUnforged' // The Unforged
	| 'Verdict' // Verdict
	| 'WolfsGravestone' // Wolf's Gravestone
	| 'UltimateOverlordsMegaMagicSword' // "Ultimate Overlord's Mega Magic Sword"
	| 'Akuoumaru' // Akuoumaru
	| 'BlackcliffSlasher' // Blackcliff Slasher
	| 'EarthShaker' // Earth Shaker
	| 'FavoniusGreatsword' // Favonius Greatsword
	| 'FlameForgedInsight' // Flame-Forged Insight
	| 'ForestRegalia' // Forest Regalia
	| 'FruitfulHook' // Fruitful Hook
	| 'KatsuragikiriNagamasa' // Katsuragikiri Nagamasa
	| 'LithicBlade' // Lithic Blade
	| 'LuxuriousSeaLord' // Luxurious Sea-Lord
	| 'MailedFlower' // Mailed Flower
	| 'MakhairaAquamarine' // Makhaira Aquamarine
	| 'PortablePowerSaw' // Portable Power Saw
	| 'PrototypeArchaic' // Prototype Archaic
	| 'Rainslasher' // Rainslasher
	| 'RoyalGreatsword' // Royal Greatsword
	| 'SacrificialGreatsword' // Sacrificial Greatsword
	| 'SerpentSpine' // Serpent Spine
	| 'SnowTombedStarsilver' // Snow-Tombed Starsilver
	| 'TalkingStick' // Talking Stick
	| 'TheBell' // The Bell
	| 'TidalShadow' // Tidal Shadow
	| 'Whiteblind' // Whiteblind
	| 'BloodtaintedGreatsword' // Bloodtainted Greatsword
	| 'DebateClub' // Debate Club
	| 'FerrousShadow' // Ferrous Shadow
	| 'SkyriderGreatsword' // Skyrider Greatsword
	| 'WhiteIronGreatsword' // White Iron Greatsword
	| 'OldMercsPal' // Old Merc's Pal
	| 'WasterGreatsword' // Waster Greatsword
	| 'CalamityQueller' // Calamity Queller
	| 'CrimsonMoonsSemblance' // Crimson Moon's Semblance
	| 'EngulfingLightning' // Engulfing Lightning
	| 'FracturedHalo' // Fractured Halo
	| 'LumidouceElegy' // Lumidouce Elegy
	| 'PrimordialJadeWingedSpear' // Primordial Jade Winged-Spear
	| 'SkywardSpine' // Skyward Spine
	| 'StaffOfHoma' // Staff of Homa
	| 'StaffOfTheScarletSands' // Staff of the Scarlet Sands
	| 'SymphonistOfScents' // Symphonist of Scents
	| 'VortexVanquisher' // Vortex Vanquisher
	| 'TheCatch' // "The Catch"
	| 'BalladOfTheFjords' // Ballad of the Fjords
	| 'BlackcliffPole' // Blackcliff Pole
	| 'CrescentPike' // Crescent Pike
	| 'Deathmatch' // Deathmatch
	| 'DialoguesOfTheDesertSages' // Dialogues of the Desert Sages
	| 'DragonsBane' // Dragon's Bane
	| 'DragonspineSpear' // Dragonspine Spear
	| 'FavoniusLance' // Favonius Lance
	| 'FootprintOfTheRainbow' // Footprint of the Rainbow
	| 'KitainCrossSpear' // Kitain Cross Spear
	| 'LithicSpear' // Lithic Spear
	| 'MissiveWindspear' // Missive Windspear
	| 'Moonpiercer' // Moonpiercer
	| 'MountainBracingBolt' // Mountain-Bracing Bolt
	| 'ProspectorsDrill' // Prospector's Drill
	| 'PrototypeStarglitter' // Prototype Starglitter
	| 'RightfulReward' // Rightful Reward
	| 'RoyalSpear' // Royal Spear
	| 'TamayurateiNoOhanashi' // Tamayuratei no Ohanashi
	| 'WavebreakersFin' // Wavebreaker's Fin
	| 'BlackTassel' // Black Tassel
	| 'Halberd' // Halberd
	| 'WhiteTassel' // White Tassel
	| 'IronPoint' // Iron Point
	| 'BeginnersProtector' // Beginner's Protector
	| 'AThousandFloatingDreams' // A Thousand Floating Dreams
	| 'CashflowSupervision' // Cashflow Supervision
	| 'CranesEchoingCall' // Crane's Echoing Call
	| 'EverlastingMoonglow' // Everlasting Moonglow
	| 'JadefallsSplendor' // Jadefall's Splendor
	| 'KagurasVerity' // Kagura's Verity
	| 'LostPrayerToTheSacredWinds' // Lost Prayer to the Sacred Winds
	| 'MemoryOfDust' // Memory of Dust
	| 'SkywardAtlas' // Skyward Atlas
	| 'StarcallersWatch' // Starcaller's Watch
	| 'SunnyMorningSleepIn' // Sunny Morning Sleep-In
	| 'SurfsUp' // Surf's Up
	| 'TomeOfTheEternalFlow' // Tome of the Eternal Flow
	| 'TulaytullahsRemembrance' // Tulaytullah's Remembrance
	| 'VividNotions' // Vivid Notions
	| 'AshGravenDrinkingHorn' // Ash-Graven Drinking Horn
	| 'BalladOfTheBoundlessBlue' // Ballad of the Boundless Blue
	| 'BlackcliffAgate' // Blackcliff Agate
	| 'DodocoTales' // Dodoco Tales
	| 'EyeOfPerception' // Eye of Perception
	| 'FavoniusCodex' // Favonius Codex
	| 'FlowingPurity' // Flowing Purity
	| 'Frostbearer' // Frostbearer
	| 'FruitOfFulfillment' // Fruit of Fulfillment
	| 'HakushinRing' // Hakushin Ring
	| 'MappaMare' // Mappa Mare
	| 'OathswornEye' // Oathsworn Eye
	| 'PrototypeAmber' // Prototype Amber
	| 'RingOfYaxche' // Ring of Yaxche
	| 'RoyalGrimoire' // Royal Grimoire
	| 'SacrificialFragments' // Sacrificial Fragments
	| 'SacrificialJade' // Sacrificial Jade
	| 'SolarPearl' // Solar Pearl
	| 'TheWidsith' // The Widsith
	| 'WanderingEvenstar' // Wandering Evenstar
	| 'WaveridingWhirl' // Waveriding Whirl
	| 'WineAndSong' // Wine and Song
	| 'EmeraldOrb' // Emerald Orb
	| 'MagicGuide' // Magic Guide
	| 'OtherworldlyStory' // Otherworldly Story
	| 'ThrillingTalesOfDragonSlayers' // Thrilling Tales of Dragon Slayers
	| 'TwinNephrite' // Twin Nephrite
	| 'PocketGrimoire' // Pocket Grimoire
	| 'ApprenticesNotes' // Apprentice's Notes
	| 'AmosBow' // Amos' Bow
	| 'AquaSimulacra' // Aqua Simulacra
	| 'AstralVulturesCrimsonPlumage' // Astral Vulture's Crimson Plumage
	| 'ElegyForTheEnd' // Elegy for the End
	| 'HuntersPath' // Hunter's Path
	| 'PolarStar' // Polar Star
	| 'SilvershowerHeartstrings' // Silvershower Heartstrings
	| 'SkywardHarp' // Skyward Harp
	| 'TheFirstGreatMagic' // The First Great Magic
	| 'ThunderingPulse' // Thundering Pulse
	| 'AlleyHunter' // Alley Hunter
	| 'BlackcliffWarbow' // Blackcliff Warbow
	| 'ChainBreaker' // Chain Breaker
	| 'Cloudforged' // Cloudforged
	| 'CompoundBow' // Compound Bow
	| 'EndOfTheLine' // End of the Line
	| 'FadingTwilight' // Fading Twilight
	| 'FavoniusWarbow' // Favonius Warbow
	| 'FlowerWreathedFeathers' // Flower-Wreathed Feathers
	| 'Hamayumi' // Hamayumi
	| 'IbisPiercer' // Ibis Piercer
	| 'KingsSquire' // King's Squire
	| 'MitternachtsWaltz' // Mitternachts Waltz
	| 'MouunsMoon' // Mouun's Moon
	| 'Predator' // Predator
	| 'PrototypeCrescent' // Prototype Crescent
	| 'RangeGauge' // Range Gauge
	| 'RoyalBow' // Royal Bow
	| 'Rust' // Rust
	| 'SacrificialBow' // Sacrificial Bow
	| 'ScionOfTheBlazingSun' // Scion of the Blazing Sun
	| 'SequenceOfSolitude' // Sequence of Solitude
	| 'SongOfStillness' // Song of Stillness
	| 'TheStringless' // The Stringless
	| 'TheViridescentHunt' // The Viridescent Hunt
	| 'WindblumeOde' // Windblume Ode
	| 'Messenger' // Messenger
	| 'RavenBow' // Raven Bow
	| 'RecurveBow' // Recurve Bow
	| 'SharpshootersOath' // Sharpshooter's Oath
	| 'Slingshot' // Slingshot
	| 'SeasonedHuntersBow' // Seasoned Hunter's Bow
	| 'HuntersBow'; // Hunter's Bow
