module.exports = {
    async refreshCache(interaction) {
        const GUILD_ID = process.env.GUILD_ID;
        const g = await interaction.client.guilds.fetch(GUILD_ID).then(gi => {return gi})
        const obj = g.members.cache
        const rolesObjs = g.roles.cache
        // console.log("CACHE SIZE: " + obj.size)
        // console.log("CACHE SIZE ROLES: " + rolesObjs.size)
        // console.log("array------------------------------------")
        const array = Array.from(obj.keys())
        const arrayRoles = Array.from(rolesObjs.keys())
        // console.log(array)
        // console.log(arrayRoles)
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            g.members.cache.delete(element)
        }
        const every1 = await g.roles.everyone
        const everyoneId = every1.id
        for (let index = 0; index < arrayRoles.length; index++) {
            const element = arrayRoles[index];
            if(element !== everyoneId){
                g.roles.cache.delete(element)
            }
        }
        // console.log("confirm------------------------------------")
        const g2 = await interaction.client.guilds.fetch(GUILD_ID).then(gi => {return gi})
        const obj2 = g2.members.cache
        const obj2Roles = g2.roles.cache
        if (obj2.size === 0 && obj2Roles.size === 1 ) {
            console.log("CACHE CLEARED")
        } else {
            console.log("CACHE CLEARING FAILED")
            console.log("CACHE SIZE: " + obj2.size)
            console.log("CACHE SIZE ROLES: " + obj2Roles.size)
        }
    
        // console.log("members------------------------------------")
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            const memb = await g.members.fetch(element).then(m => {return m})
            const member = await g.members.fetch({user: memb, force: true}).then(m => {return m})
            // console.log("   " + member.user.username + "-----------------------------------------------------------------------------------------")
            // console.log(member)
            // console.log("------------------------------------------------------------------------------------------------------------------")
        }
        // console.log("members end------------------------------------")
    
        // console.log("roles------------------------------------")
        for (let index = 0; index < arrayRoles.length; index++) {
            const element = arrayRoles[index];
            const role = await g.roles.fetch(element).then(r => {return r})
            // console.log("   " + role.name + "-----------------------------------------------------------------------------------------")
            // console.log(role)
            // console.log("------------------------------------------------------------------------------------------------------------------")
        }
        // console.log("roles end------------------------------------")
        console.log("CACHE CLEARING ENDED")
    }
}
