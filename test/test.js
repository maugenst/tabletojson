 const tabletojson = require("tabletojson").Tabletojson;

        tabletojson.convertUrl(
          `https://www.funcraft.net/fr/classement/rush`,
          function(tablesAsJson) {
            setTimeout(async () => {
              msg.delete();
              const embed = new Discord.MessageEmbed()
                .setTitle("•__Classement Rush__•")
                .setColor(data.config.embed.color)
                .setFooter(data.config.embed.footer);
              const mappedTable = tablesAsJson[0].filter(
                elem => elem["#"] <= 9
              );
              mappedTable.forEach(player => {
                embed.addField(
                  `[#**${player["#"]}**] | ${player["Joueur"]}`,
                  `:sparkles: Point(s) : \`${
                    player["Points"]
                  }\`\n:balloon: Partie(s) : \`${
                    player["Parties"]
                  }\`\n<:emote:686100686269841410> Victoire(s) : \`${
                    player["Victoires"]
                  }\`\n<:lose:691292736552304692> Défaite(s) : \`${
                    player["Défaites"]
                  }\`\n<:chrono:689501453529907328> Temps de jeu : \`${player[
                    "Temps de jeu"
                  ].replace(
                    " ",
                    ""
                  )}\`\n<:kill:689518623215190078> Kill(s) : \`${
                    player["Kills"]
                  }\`\n:skull: Mort(s) : \`${
                    player["Morts"]
                  }\`\n:bed: Lit(s) Détruit(s) : \`${
                    player["Lits détruits"]
                  }\` `,
                  true
                );
              });
              return message.channel.send(embed);
            },4000);
          }
        );
