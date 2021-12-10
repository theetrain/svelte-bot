import { event } from 'jellycommands';
import urlRegex from 'url-regex';
import niceTry from 'nice-try';

// TODO discuss best way to store these ids
const linkOnlyChannels = [
    // Testing Channel
    '918915215368810566',

    // Showcase
    '479653552869081089',

    // Resources
    '837012201444999248',
];

const autoThreadChannels = [
    // testing
    '918932662226386994',

    // Showcase
    '479653552869081089',

    // Resources
    '837012201444999248',
];

export default event({
    name: 'messageCreate',

    run: async ({}, message) => {
        if (message.author.bot) return;

        if (linkOnlyChannels.includes(message.channel.id)) {
            const hasLink = urlRegex().test(message.content);

            if (!hasLink) {
                try {
                    if (message.deletable) await message.delete();

                    await message.author.send({
                        embeds: [
                            {
                                description: `Your message in ${message.channel.toString()} was removed since it doesn't contain a link, if you are trying to showcase a project please post a link with your text. Otherwise all conversation should be inside a thread\n\nYour message was sent below so you don't lose it!`,
                            },
                        ],
                    });

                    await message.author.send({
                        content: message.content,
                    });
                } catch {
                    // this will fail if message is already deleted but we don't know or if the dm can't be sent - either way we don't need to do anything
                }

                return;
            }
        }

        if (
            autoThreadChannels.includes(message.channel.id) &&
            !message.hasThread &&
            message.channel.type == 'GUILD_TEXT'
        ) {
            try {
                message.channel.threads.create({
                    name: 'Discussion',
                    startMessage: message,
                });
            } catch {
                // we can ignore this error since chances are it will be that thread already exists
            }
        }
    },
});
