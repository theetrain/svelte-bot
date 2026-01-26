import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessagePayload,
} from 'discord.js';
import { event } from 'jellycommands';
import { THREAD_FAQ_TAGS } from 'src/config';

function contains_faq_tag(tags: string[]) {
	return tags.some((tag) => THREAD_FAQ_TAGS.includes(tag));
}

export default event({
	name: 'threadUpdate',

	async run(_, old_thread, new_thread) {
		// FAQ thread tag handler

		// don't handle cases when FAQ tags aren't used
		if (!contains_faq_tag(new_thread.appliedTags)) return;

		// post FAQ message
		const close_button = new ActionRowBuilder<ButtonBuilder>({
			components: [
				new ButtonBuilder()
					.setLabel('Close as duplicate')
					.setCustomId(`faq_close_${new_thread.ownerId}`)
					.setStyle(ButtonStyle.Primary),
			],
		});

		const payload = new MessagePayload(new_thread, {
			content: `This is a frequently asked question! You can use the "FAQ" tag to filter and browse other posts like this.`,
			components: [close_button],
		});

		new_thread.send(payload);
	},
});
