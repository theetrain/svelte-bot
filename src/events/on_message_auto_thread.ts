import { Message, MessageOptions, ThreadChannel } from 'discord.js';
import { event } from 'jellycommands';
import urlRegex from 'url-regex';
import {
	AUTO_THREAD_CHANNELS,
	HELP_CHANNELS,
	LINK_ONLY_CHANNELS,
} from '../config.js';
import { build_embed } from '../utils/embed_helpers.js';
import { rename_thread } from '../utils/threads.js';
import { get_title_from_url } from '../utils/unfurl.js';

export default event({
	name: 'messageCreate',
	run: async ({}, message) => {
		if (message.author.bot) return;

		if (
			AUTO_THREAD_CHANNELS.includes(message.channel.id) &&
			!message.hasThread &&
			message.channel.type == 'GUILD_TEXT'
		) {
			try {
				const thread = await message.channel.threads.create({
					name: 'Loading Name...',
					startMessage: message,
				});

				thread.send(instruction_message(thread)).catch(() => {});

				// Generate the thread name after so that the thread creates faster
				await rename_thread(
					thread,
					await get_thread_name(message),
					HELP_CHANNELS.includes(message.channelId),
				);
			} catch {
				// we can ignore this error since chances are it will be that thread already exists
			}
		}
	},
});

function get_thread_name(message: Message): string | Promise<string> {
	const url = message.content.match(urlRegex());

	// If the channel isn't a link channel (i.e. a question one) or url can't be matched
	if (!LINK_ONLY_CHANNELS.includes(message.channelId) || !url)
		return `${message.content.replace(urlRegex(), '')}`;

	return get_title_from_url(url[0]);
}

function instruction_message(thread: ThreadChannel): MessageOptions {
	return {
		embeds: [
			build_embed({
				description: `I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the \`/thread rename\` command if I failed to set a proper name for it.${
					HELP_CHANNELS.includes(thread.parentId!)
						? '\nWhen your problem is solved you can archive it with `/thread archive`'
						: ''
				}`,
			}),
		],
	};
}