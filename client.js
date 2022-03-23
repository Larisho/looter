class GameEvent {
    name
    hash
    dataSize

    constructor(name, dataSize) {
        this.name = name;
        this.hash = GetHashKey(name);
        this.dataSize = dataSize;
    }
}

class GameEventMap {
    eventMap

    constructor() {
        this.eventMap = new Map();
    }

    put(event) {
        this.eventMap.set(event.hash, event);
    }

    get(hashedEventName) {
        return this.eventMap.get(hashedEventName);
    }

    has(item) {
        return this.eventMap.has(item);
    }
}

const eventMap = new GameEventMap();
// eventMap.put(new GameEvent('EVENT_CALCULATE_LOOT', 26))
eventMap.put(new GameEvent('EVENT_LOOT', 36));
eventMap.put(new GameEvent('EVENT_LOOT_COMPLETE', 3));
// eventMap.put(new GameEvent('EVENT_LOOT_VALIDATION_FAIL', 2));
// eventMap.put(new GameEvent('EVENT_LOOT_PLANT_START', 36));
eventMap.put(new GameEvent('EVENT_CONTAINER_INTERACTION', 4));
// eventMap.put(new GameEvent('EVENT_CARRIABLE_PROMPT_INFO_REQUEST', 6));

function isHumanPed(entityId) {
    const hash = GetEntityModel(entityId);

    return !nonHumanPedModels.includes(hash); // checking non-human peds because the list is shorter
}

setTick(() => {
    const eventCount = GetNumberOfEvents(0);

    for (let i = 0; i < eventCount; i++) {
        const event = GetEventAtIndex(0, i);

        if (eventMap.has(event)) {
            const e = eventMap.get(event);
            console.log(e.name);

            // data size is actually the number of values returned, not the byte count.
            // That's why needs to be multiplied by 8 because each datum is 8 bytes
            const buffer = new ArrayBuffer(e.dataSize * 8);
            const view = new DataView(buffer);

            let res = Citizen.invokeNative("0x57EC5FA4D4D6AFCA", 0, i, view, e.dataSize) // GetEventData(group, eventIndex, buffer, dataSize) -> success flag

            console.log('data: ', res ? 'success' : 'failure');
            const data = new Int32Array(buffer);
            console.log('Size: ' + data.length);

            // normalize data into an object because they print better in the console
            const normalizedData = {};
            let key = 0;

            // we need to skip every other datum because RAGE is 64bit but the data is 32bit
            // we need to read it as a value stored every 64bits that only takes up 32bits of space.
            for (let i = 0; i < data.length; i += 2) {
                normalizedData[key++] = data[i];
            }

            console.log(JSON.stringify(normalizedData, null, 2)); // pretty print to console

            if (e.name === 'EVENT_CONTAINER_INTERACTION' && normalizedData[3] === 0 /*  isContainerClosed after interaction */) {
                emitNet(
                    'loot_container',
                    PlayerPedId() /* player id */,
                    normalizedData[1] /* searched entity id */
                );

            } else if (e.name === 'EVENT_LOOT_COMPLETE' &&
                normalizedData[2] === 1 /* isLootSuccess */ &&
                isHumanPed(normalizedData[1] /* looted entity id */)) {

                emitNet(
                    'loot_human_ped',
                    PlayerPedId() /* player id */,
                    normalizedData[1] /* lootedEntityId */
                );
            }
        }
    }
});

const nonHumanPedModels = [
    "a_c_alligator_01",
    "a_c_alligator_02",
    "a_c_alligator_03",
    "a_c_armadillo_01",
    "a_c_badger_01",
    "a_c_bat_01",
    "a_c_bearblack_01",
    "a_c_bear_01",
    "a_c_beaver_01",
    "a_c_bighornram_01",
    "a_c_bluejay_01",
    "a_c_boarlegendary_01",
    "a_c_boar_01",
    "a_c_buck_01",
    "a_c_buffalo_01",
    "a_c_buffalo_tatanka_01",
    "a_c_bull_01",
    "a_c_californiacondor_01",
    "a_c_cardinal_01",
    "a_c_carolinaparakeet_01",
    "a_c_cat_01",
    "a_c_cedarwaxwing_01",
    "a_c_chicken_01",
    "a_c_chipmunk_01",
    "a_c_cormorant_01",
    "a_c_cougar_01",
    "a_c_cow",
    "a_c_coyote_01",
    "a_c_crab_01",
    "a_c_cranewhooping_01",
    "a_c_crawfish_01",
    "a_c_crow_01",
    "a_c_deer_01",
    "a_c_dogamericanfoxhound_01",
    "a_c_dogaustraliansheperd_01",
    "a_c_dogbluetickcoonhound_01",
    "a_c_dogcatahoulacur_01",
    "a_c_dogchesbayretriever_01",
    "a_c_dogcollie_01",
    "a_c_doghobo_01",
    "a_c_doghound_01",
    "a_c_doghusky_01",
    "a_c_doglab_01",
    "a_c_doglion_01",
    "a_c_dogpoodle_01",
    "a_c_dogrufus_01",
    "a_c_dogstreet_01",
    "re_lostdog_dogs_01",
    "a_c_donkey_01",
    "a_c_duck_01",
    "a_c_eagle_01",
    "a_c_egret_01",
    "a_c_elk_01",
    "a_c_fishbluegil_01_ms",
    "a_c_fishbluegil_01_sm",
    "a_c_fishbullheadcat_01_ms",
    "a_c_fishbullheadcat_01_sm",
    "a_c_fishchainpickerel_01_ms",
    "a_c_fishchainpickerel_01_sm",
    "a_c_fishchannelcatfish_01_lg",
    "a_c_fishchannelcatfish_01_xl",
    "a_c_fishlakesturgeon_01_lg",
    "a_c_fishlargemouthbass_01_lg",
    "a_c_fishlargemouthbass_01_ms",
    "a_c_fishlongnosegar_01_lg",
    "a_c_fishmuskie_01_lg",
    "a_c_fishnorthernpike_01_lg",
    "a_c_fishperch_01_ms",
    "a_c_fishperch_01_sm",
    "a_c_fishrainbowtrout_01_lg",
    "a_c_fishrainbowtrout_01_ms",
    "a_c_fishredfinpickerel_01_ms",
    "a_c_fishredfinpickerel_01_sm",
    "a_c_fishrockbass_01_ms",
    "a_c_fishrockbass_01_sm",
    "a_c_fishsalmonsockeye_01_lg",
    "a_c_fishsalmonsockeye_01_ml",
    "a_c_fishsalmonsockeye_01_ms",
    "a_c_fishsmallmouthbass_01_lg",
    "a_c_fishsmallmouthbass_01_ms",
    "a_c_fox_01",
    "a_c_frogbull_01",
    "a_c_gilamonster_01",
    "a_c_goat_01",
    "a_c_goosecanada_01",
    "a_c_hawk_01",
    "a_c_heron_01",
    "a_c_horsemulepainted_01",
    "a_c_horsemule_01",
    "p_c_horse_01",
    "a_c_horse_americanpaint_greyovero",
    "a_c_horse_americanpaint_overo",
    "a_c_horse_americanpaint_splashedwhite",
    "a_c_horse_americanpaint_tobiano",
    "a_c_horse_americanstandardbred_black",
    "a_c_horse_americanstandardbred_buckskin",
    "a_c_horse_americanstandardbred_lightbuckskin",
    "a_c_horse_americanstandardbred_palominodapple",
    "a_c_horse_americanstandardbred_silvertailbuckskin",
    "a_c_horse_andalusian_darkbay",
    "a_c_horse_andalusian_perlino",
    "a_c_horse_andalusian_rosegray",
    "a_c_horse_appaloosa_blacksnowflake",
    "a_c_horse_appaloosa_blanket",
    "a_c_horse_appaloosa_brownleopard",
    "a_c_horse_appaloosa_fewspotted_pc",
    "a_c_horse_appaloosa_leopard",
    "a_c_horse_appaloosa_leopardblanket",
    "a_c_horse_arabian_black",
    "a_c_horse_arabian_grey",
    "a_c_horse_arabian_redchestnut",
    "a_c_horse_arabian_redchestnut_pc",
    "a_c_horse_arabian_rosegreybay",
    "a_c_horse_arabian_warpedbrindle_pc",
    "a_c_horse_arabian_white",
    "a_c_horse_ardennes_bayroan",
    "a_c_horse_ardennes_irongreyroan",
    "a_c_horse_ardennes_strawberryroan",
    "a_c_horse_belgian_blondchestnut",
    "a_c_horse_belgian_mealychestnut",
    "a_c_horse_breton_grullodun",
    "a_c_horse_breton_mealydapplebay",
    "a_c_horse_breton_redroan",
    "a_c_horse_breton_sealbrown",
    "a_c_horse_breton_sorrel",
    "a_c_horse_breton_steelgrey",
    "a_c_horse_buell_warvets",
    "a_c_horse_criollo_baybrindle",
    "a_c_horse_criollo_bayframeovero",
    "a_c_horse_criollo_blueroanovero",
    "a_c_horse_criollo_dun",
    "a_c_horse_criollo_marblesabino",
    "a_c_horse_criollo_sorrelovero",
    "a_c_horse_dutchwarmblood_chocolateroan",
    "a_c_horse_dutchwarmblood_sealbrown",
    "a_c_horse_dutchwarmblood_sootybuckskin",
    "a_c_horse_eagleflies",
    "a_c_horse_gang_bill",
    "a_c_horse_gang_charles",
    "a_c_horse_gang_charles_endlesssummer",
    "a_c_horse_gang_dutch",
    "a_c_horse_gang_hosea",
    "a_c_horse_gang_javier",
    "a_c_horse_gang_john",
    "a_c_horse_gang_karen",
    "a_c_horse_gang_kieran",
    "a_c_horse_gang_lenny",
    "a_c_horse_gang_micah",
    "a_c_horse_gang_sadie",
    "a_c_horse_gang_sadie_endlesssummer",
    "a_c_horse_gang_sean",
    "a_c_horse_gang_trelawney",
    "a_c_horse_gang_uncle",
    "a_c_horse_gang_uncle_endlesssummer",
    "a_c_horse_hungarianhalfbred_darkdapplegrey",
    "a_c_horse_hungarianhalfbred_flaxenchestnut",
    "a_c_horse_hungarianhalfbred_liverchestnut",
    "a_c_horse_hungarianhalfbred_piebaldtobiano",
    "a_c_horse_john_endlesssummer",
    "a_c_horse_kentuckysaddle_black",
    "a_c_horse_kentuckysaddle_buttermilkbuckskin_pc",
    "a_c_horse_kentuckysaddle_chestnutpinto",
    "a_c_horse_kentuckysaddle_grey",
    "a_c_horse_kentuckysaddle_silverbay",
    "a_c_horse_kladruber_black",
    "a_c_horse_kladruber_cremello",
    "a_c_horse_kladruber_dapplerosegrey",
    "a_c_horse_kladruber_grey",
    "a_c_horse_kladruber_silver",
    "a_c_horse_kladruber_white",
    "a_c_horse_missourifoxtrotter_amberchampagne",
    "a_c_horse_missourifoxtrotter_sablechampagne",
    "a_c_horse_missourifoxtrotter_silverdapplepinto",
    "a_c_horse_morgan_bay",
    "a_c_horse_morgan_bayroan",
    "a_c_horse_morgan_flaxenchestnut",
    "a_c_horse_morgan_liverchestnut_pc",
    "a_c_horse_morgan_palomino",
    "a_c_horse_mp_mangy_backup",
    "a_c_horse_murfreebrood_mange_01",
    "a_c_horse_murfreebrood_mange_02",
    "a_c_horse_murfreebrood_mange_03",
    "a_c_horse_mustang_goldendun",
    "a_c_horse_mustang_grullodun",
    "a_c_horse_mustang_tigerstripedbay",
    "a_c_horse_mustang_wildbay",
    "a_c_horse_nokota_blueroan",
    "a_c_horse_nokota_reversedappleroan",
    "a_c_horse_nokota_whiteroan",
    "a_c_horse_shire_darkbay",
    "a_c_horse_shire_lightgrey",
    "a_c_horse_shire_ravenblack",
    "a_c_horse_suffolkpunch_redchestnut",
    "a_c_horse_suffolkpunch_sorrel",
    "a_c_horse_tennesseewalker_blackrabicano",
    "a_c_horse_tennesseewalker_chestnut",
    "a_c_horse_tennesseewalker_dapplebay",
    "a_c_horse_tennesseewalker_flaxenroan",
    "a_c_horse_tennesseewalker_goldpalomino_pc",
    "a_c_horse_tennesseewalker_mahoganybay",
    "a_c_horse_tennesseewalker_redroan",
    "a_c_horse_thoroughbred_blackchestnut",
    "a_c_horse_thoroughbred_bloodbay",
    "a_c_horse_thoroughbred_brindle",
    "a_c_horse_thoroughbred_dapplegrey",
    "a_c_horse_thoroughbred_reversedappleblack",
    "a_c_horse_turkoman_darkbay",
    "a_c_horse_turkoman_gold",
    "a_c_horse_turkoman_silver",
    "a_c_horse_winter02_01",
    "a_c_iguanadesert_01",
    "a_c_iguana_01",
    "a_c_javelina_01",
    "a_c_lionmangy_01",
    "a_c_loon_01",
    "a_c_moose_01",
    "a_c_muskrat_01",
    "a_c_oriole_01",
    "a_c_owl_01",
    "a_c_ox_01",
    "a_c_panther_01",
    "a_c_parrot_01",
    "a_c_pelican_01",
    "a_c_pheasant_01",
    "a_c_pigeon",
    "a_c_pig_01",
    "a_c_possum_01",
    "a_c_prairiechicken_01",
    "a_c_pronghorn_01",
    "a_c_quail_01",
    "a_c_rabbit_01",
    "a_c_raccoon_01",
    "a_c_rat_01",
    "a_c_raven_01",
    "a_c_redfootedbooby_01",
    "a_c_robin_01",
    "a_c_rooster_01",
    "a_c_roseatespoonbill_01",
    "a_c_seagull_01",
    "a_c_sharkhammerhead_01",
    "a_c_sharktiger",
    "a_c_sheep_01",
    "a_c_skunk_01",
    "a_c_snakeblacktailrattle_01",
    "a_c_snakeblacktailrattle_pelt_01",
    "a_c_snakeferdelance_01",
    "a_c_snakeferdelance_pelt_01",
    "a_c_snakeredboa10ft_01",
    "a_c_snakeredboa_01",
    "a_c_snakeredboa_pelt_01",
    "a_c_snakewater_01",
    "a_c_snakewater_pelt_01",
    "a_c_snake_01",
    "a_c_snake_pelt_01",
    "a_c_songbird_01",
    "a_c_sparrow_01",
    "a_c_squirrel_01",
    "a_c_toad_01",
    "a_c_turkeywild_01",
    "a_c_turkey_01",
    "a_c_turkey_02",
    "a_c_turtlesea_01",
    "a_c_turtlesnapping_01",
    "a_c_vulture_01",
    "A_C_Wolf",
    "a_c_wolf_medium",
    "a_c_wolf_small",
    "a_c_woodpecker_01",
    "a_c_woodpecker_02",
].map(o => GetHashKey(o));