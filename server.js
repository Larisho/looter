onNet('loot_human_ped', (source, args) => {
    console.log(`human ped was looted by ${source}. They looted a ${args}`);
})

onNet('loot_container', (source, args) => {
    console.log(`container was looted by ${source}. They looted a ${args}`);
});