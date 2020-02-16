/**
 * This object represents the content of a message to be sent as a result
 * of an inline query.
 */
export type InputMessageContent =
	IInputTextMessageContent
	| IInputLocationMessageContent
	| IInputVenueMessageContent
	| IInputContactMessageContent;

/**
 * This object represents an incoming update.At most one of the optional
 * parameters can be present in any given update.
 * @see https://core.telegram.org/bots/api#available-types
 */
export interface IUpdate {
	/**
	 * The update‘s unique identifier. Update identifiers start from a certain
	 * positive number and increase sequentially. This ID becomes especially
	 * handy if you’re using Webhooks, since it allows you to ignore repeated
	 * updates or to restore the correct update sequence, should they get out
	 * of order. If there are no new updates for at least a week, then
	 * identifier of the next update will be chosen randomly instead of sequentially.
	 * @see https://core.telegram.org/bots/api#setwebhook
	 */
	update_id: number;

	/**
	 * New incoming message of any kind — text, photo, sticker, etc.
	 */
	message?: IMessage;

	/**
	 * New version of a message that is known to the menu and was edited
	 */
	edited_message?: IMessage;

	/**
	 * New incoming channel post of any kind — text, photo, sticker, etc.
	 */
	channel_post?: IMessage;

	/**
	 * New version of a channel post that is known to the menu and was edited
	 */
	edited_channel_post?: IMessage;

	/**
	 * New incoming inline query
	 * @see https://core.telegram.org/bots/api#inline-mode
	 */
	inline_query?: IInlineQuery;

	/**
	 * The result of an inline query that was chosen by a user and sent to
	 * their chat partner. Please see our documentation on the feedback
	 * collecting for details on how to enable these updates for your menu.
	 * @see https://core.telegram.org/bots/api#inline-mode
	 * @see https://core.telegram.org/bots/api/bots/inline#collecting-feedback
	 */
	chosen_inline_result?: IChosenInlineResult;

	/**
	 * New incoming callback query
	 */
	callback_query?: ICallbackQuery;

	/**
	 * New incoming shipping query. Only for invoices with flexible price
	 */
	shipping_query?: IShippingQuery;

	/**
	 * New incoming pre-checkout query. Contains full information about checkout
	 */
	pre_checkout_query?: IPreCheckoutQuery;
}

/**
 * Contains information about the current status of a webhook.
 */
export interface IWebhookInfo {
	/**
	 * Webhook URL, may be empty if webhook is not set up
	 */
	url: string;

	/**
	 * True, if a custom certificate was provided for webhook certificate checks
	 */
	has_custom_certificate: boolean;

	/**
	 * Number of updates awaiting delivery
	 */
	pending_update_count: number;

	/**
	 * Unix time for the most recent error that happened when trying to deliver
	 * an update via webhook
	 */
	last_error_date?: number;

	/**
	 * Error message in human-readable format for the most recent error that
	 * happened when trying to deliver an update via webhook
	 */
	last_error_message?: string;

	/**
	 * Maximum allowed number of simultaneous HTTPS connections to the webhook
	 * for update delivery
	 */
	max_connections?: number;

	/**
	 * A list of update types the menu is subscribed to. Defaults to all update types
	 */
	allowed_updates?: string[];
}

/**
 * This object represents a Telegram user or menu.
 */
export interface IUser {
	/**
	 * Unique identifier for this user or menu
	 */
	id: number;

	/**
	 * True, if this user is a menu
	 */
	is_bot: boolean;

	/**
	 * IUser‘s or menu’s first name
	 */
	first_name: string;

	/**
	 * IUser‘s or menu’s last name
	 */
	last_name?: string;

	/**
	 * IUser‘s or menu’s username
	 */
	username?: string;

	/**
	 * IETF language tag of the user's language
	 * @see https://en.wikipedia.org/wiki/IETF_language_tag
	 */
	language_code?: string;
}

/**
 * This object represents a chat.
 */
export interface IChat {
	/**
	 * Unique identifier for this chat. This number may be greater than 32 bits
	 * and some programming languages may have difficulty/silent defects in
	 * interpreting it. But it is smaller than 52 bits, so a signed 64 bit
	 * integer or double-precision float type are safe for storing this identifier.
	 */
	id: number;

	/**
	 * Type of chat, can be either “private”, “group”, “supergroup” or “channel”
	 */
	type: string;

	/**
	 * Title, for supergroups, channels and group chats
	 */
	title?: string;

	/**
	 * Username, for private chats, supergroups and channels if available
	 */
	username?: string;

	/**
	 * First name of the other party in a private chat
	 */
	first_name?: string;

	/**
	 * Last name of the other party in a private chat
	 */
	last_name?: string;

	/**
	 * True if a group has ‘All Members Are Admins’ enabled.
	 */
	all_members_are_administrators?: boolean;

	/**
	 * Chat photo. Returned only in getChat.
	 * @see https://core.telegram.org/bots/api#getchat
	 */
	photo?: IChatPhoto;

	/**
	 * Description, for supergroups and channel chats. Returned only in getChat.
	 * @see https://core.telegram.org/bots/api#getchat
	 */
	description?: string;

	/**
	 * Chat invite link, for supergroups and channel chats. Returned only in getChat.
	 * @see https://core.telegram.org/bots/api#getchat
	 */
	invite_link?: string;

	/**
	 * Pinned message, for supergroups and channel chats. Returned only in getChat.
	 * @see https://core.telegram.org/bots/api#getchat
	 */
	pinned_message?: IMessage;

	/**
	 * For supergroups, name of group sticker set. Returned only in getChat.
	 * @see https://core.telegram.org/bots/api#getchat
	 */
	sticker_set_name?: string;

	/**
	 * True, if the menu can change the group sticker set. Returned only in getChat.
	 * @see https://core.telegram.org/bots/api#getchat
	 */
	can_set_sticker_set?: boolean;
}

/**
 * This object represents a message.
 */
export interface IMessage {
	/**
	 * Unique message identifier inside this chat
	 */
	message_id: number;

	/**
	 * Sender, empty for messages sent to channels
	 */
	from?: IUser;

	/**
	 * Date the message was sent in Unix time
	 */
	date: number;

	/**
	 * Conversation the message belongs to
	 */
	chat: IChat;

	/**
	 * For forwarded messages, sender of the original message
	 */
	forward_from?: IUser;

	/**
	 * For messages forwarded from channels, information about the original channel
	 */
	forward_from_chat?: IChat;

	/**
	 * For messages forwarded from channels, identifier of the original message
	 * in the channel
	 */
	forward_from_message_id?: number;

	/**
	 * For messages forwarded from channels, signature of the post author if present
	 */
	forward_signature?: string;

	/**
	 * For forwarded messages, date the original message was sent in Unix time
	 */
	forward_date?: number;

	/**
	 * For replies, the original message. Note that the IMessage object in this
	 * field will not contain further reply_to_message fields even if it itself
	 * is a reply.
	 */
	reply_to_message?: IMessage;

	/**
	 * Date the message was last edited in Unix time
	 */
	edit_date?: number;

	/**
	 * The unique identifier of a media message group this message belongs to
	 */
	media_group_id?: string;

	/**
	 * Signature of the post author for messages in channels
	 */
	author_signature?: string;

	/**
	 * For text messages, the actual UTF-8 text of the message, 0-4096 characters.
	 */
	text?: string;

	/**
	 * For text messages, special entities like usernames, URLs, menu commands,
	 * etc. that appear in the text
	 */
	entities?: IMessageEntity[];

	/**
	 * For messages with a caption, special entities like usernames, URLs, menu
	 * commands, etc. that appear in the caption
	 */
	caption_entities?: IMessageEntity[];

	/**
	 * IMessage is an audio file, information about the file
	 */
	audio?: IAudio;

	/**
	 * IMessage is a general file, information about the file
	 */
	document?: Document;

	/**
	 * IMessage is a game, information about the game. More about games »
	 * @see https://core.telegram.org/bots/api#games
	 */
	game?: IGame;

	/**
	 * IMessage is a photo, available sizes of the photo
	 */
	photo?: IPhotoSize[];

	/**
	 * IMessage is a sticker, information about the sticker
	 */
	sticker?: ISticker;

	/**
	 * IMessage is a video, information about the video
	 */
	video?: IVideo;

	/**
	 * IMessage is a voice message, information about the file
	 */
	voice?: IVoice;

	/**
	 * IMessage is a video note, information about the video message
	 * @see https://telegram.org/blog/video-messages-and-telescope
	 */
	video_note?: IVideoNote;

	/**
	 * Caption for the audio, document, photo, video or voice, 0-200 characters
	 */
	caption?: string;

	/**
	 * IMessage is a shared contact, information about the contact
	 */
	contact?: IContact;

	/**
	 * IMessage is a shared location, information about the location
	 */
	location?: Location;

	/**
	 * IMessage is a venue, information about the venue
	 */
	venue?: IVenue;

	/**
	 * New members that were added to the group or supergroup and information
	 * about them (the menu itself may be one of these members)
	 */
	new_chat_members?: IUser[];

	/**
	 * A member was removed from the group, information about them (this member
	 * may be the menu itself)
	 */
	left_chat_member?: IUser;

	/**
	 * A chat title was changed to this value
	 */
	new_chat_title?: string;

	/**
	 * A chat photo was change to this value
	 */
	new_chat_photo?: IPhotoSize[];

	/**
	 * Service message: the chat photo was deleted
	 */
	delete_chat_photo?: true;

	/**
	 * Service message: the group has been created
	 */
	group_chat_created?: true;

	/**
	 * Service message: the supergroup has been created. This field can‘t be
	 * received in a message coming through updates, because menu can’t be a
	 * member of a supergroup when it is created. It can only be found in
	 * reply_to_message if someone replies to a very first message in a
	 * directly created supergroup.
	 */
	supergroup_chat_created?: true;

	/**
	 * Service message: the channel has been created. This field can‘t be
	 * received in a message coming through updates, because menu can’t be a
	 * member of a channel when it is created. It can only be found in
	 * reply_to_message if someone replies to a very first message in a channel.
	 */
	channel_chat_created?: true;

	/**
	 * The group has been migrated to a supergroup with the specified
	 * identifier. This number may be greater than 32 bits and some programming
	 * languages may have difficulty/silent defects in interpreting it. But it
	 * is smaller than 52 bits, so a signed 64 bit integer or double-precision
	 * float type are safe for storing this identifier.
	 */
	migrate_to_chat_id?: number;

	/**
	 * The supergroup has been migrated from a group with the specified
	 * identifier. This number may be greater than 32 bits and some programming
	 * languages may have difficulty/silent defects in interpreting it. But it
	 * is smaller than 52 bits, so a signed 64 bit integer or double-precision
	 * float type are safe for storing this identifier.
	 */
	migrate_from_chat_id?: number;

	/**
	 * Specified message was pinned. Note that the IMessage object in this field
	 * will not contain further reply_to_message fields even if it is itself a reply.
	 */
	pinned_message?: IMessage;

	/**
	 * IMessage is an invoice for a payment, information about the invoice. More
	 * about payments »
	 * @see https://core.telegram.org/bots/api#payments
	 */
	invoice?: IInvoice;

	/**
	 * IMessage is a service message about a successful payment, information
	 * about the payment. More about payments »
	 * @see https://core.telegram.org/bots/api#payments
	 */
	successful_payment?: ISuccessfulPayment;

	/**
	 * The domain name of the website on which the user has logged in. More
	 * about Telegram Login »
	 * @see https://core.telegram.org/bots/api/widgets/login
	 */
	connected_website?: string;
}

/**
 * This object represents one special entity in a text message. For
 * example, hashtags, usernames, URLs, etc.
 */
export interface IMessageEntity {
	/**
	 * Type of the entity. Can be mention (@username), hashtag, bot_command,
	 * url, email, bold (bold text), italic (italic text), code (monowidth
	 * string), pre (monowidth block), text_link (for clickable text URLs),
	 * text_mention (for users without usernames)
	 * @see https://telegram.org/blog/edit#new-mentions
	 */
	type: string;

	/**
	 * Offset in UTF-16 code units to the start of the entity
	 */
	offset: number;

	/**
	 * Length of the entity in UTF-16 code units
	 */
	length: number;

	/**
	 * For “text_link” only, url that will be opened after user taps on the text
	 */
	url?: string;

	/**
	 * For “text_mention” only, the mentioned user
	 */
	user?: IUser;
}

/**
 * This object represents one size of a photo or a file / sticker thumbnail.
 * @see https://core.telegram.org/bots/api#document
 * @see https://core.telegram.org/bots/api#sticker
 */
export interface IPhotoSize {
	/**
	 * Unique identifier for this file
	 */
	file_id: string;

	/**
	 * Photo width
	 */
	width: number;

	/**
	 * Photo height
	 */
	height: number;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents an audio file to be treated as music by the
 * Telegram clients.
 */
export interface IAudio {
	/**
	 * Unique identifier for this file
	 */
	file_id: string;

	/**
	 * Duration of the audio in seconds as defined by sender
	 */
	duration: number;

	/**
	 * Performer of the audio as defined by sender or by audio tags
	 */
	performer?: string;

	/**
	 * Title of the audio as defined by sender or by audio tags
	 */
	title?: string;

	/**
	 * MIME type of the file as defined by sender
	 */
	mime_type?: string;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents a general file (as opposed to photos, voice
 * messages and audio files).
 * @see https://core.telegram.org/bots/api#photosize
 * @see https://core.telegram.org/bots/api#voice
 * @see https://core.telegram.org/bots/api#audio
 */
export interface IDocument {
	/**
	 * Unique file identifier
	 */
	file_id: string;

	/**
	 * Document thumbnail as defined by sender
	 */
	thumb?: IPhotoSize;

	/**
	 * Original filename as defined by sender
	 */
	file_name?: string;

	/**
	 * MIME type of the file as defined by sender
	 */
	mime_type?: string;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents a video file.
 */
export interface IVideo {
	/**
	 * Unique identifier for this file
	 */
	file_id: string;

	/**
	 * Video width as defined by sender
	 */
	width: number;

	/**
	 * Video height as defined by sender
	 */
	height: number;

	/**
	 * Duration of the video in seconds as defined by sender
	 */
	duration: number;

	/**
	 * Video thumbnail
	 */
	thumb?: IPhotoSize;

	/**
	 * Mime type of a file as defined by sender
	 */
	mime_type?: string;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents a voice note.
 */
export interface IVoice {
	/**
	 * Unique identifier for this file
	 */
	file_id: string;

	/**
	 * Duration of the audio in seconds as defined by sender
	 */
	duration: number;

	/**
	 * MIME type of the file as defined by sender
	 */
	mime_type?: string;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents a video message (available in Telegram apps as of v.4.0).
 * @see https://telegram.org/blog/video-messages-and-telescope
 */
export interface IVideoNote {
	/**
	 * Unique identifier for this file
	 */
	file_id: string;

	/**
	 * Video width and height as defined by sender
	 */
	length: number;

	/**
	 * Duration of the video in seconds as defined by sender
	 */
	duration: number;

	/**
	 * Video thumbnail
	 */
	thumb?: IPhotoSize;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents a phone contact.
 */
export interface IContact {
	/**
	 * Contact's phone number
	 */
	phone_number: string;

	/**
	 * Contact's first name
	 */
	first_name: string;

	/**
	 * Contact's last name
	 */
	last_name?: string;

	/**
	 * Contact's user identifier in Telegram
	 */
	user_id?: number;
}

/**
 * This object represents a point on the map.
 */
export interface ILocation {
	/**
	 * Longitude as defined by sender
	 */
	longitude: number;

	/**
	 * Latitude as defined by sender
	 */
	latitude: number;
}

/**
 * This object represents a venue.
 */
export interface IVenue {
	/**
	 * Venue location
	 */
	location: ILocation;

	/**
	 * Name of the venue
	 */
	title: string;

	/**
	 * Address of the venue
	 */
	address: string;

	/**
	 * Foursquare identifier of the venue
	 */
	foursquare_id?: string;
}

/**
 * This object represent a user's profile pictures.
 */
export interface IUserProfilePhotos {
	/**
	 * Total number of profile pictures the target user has
	 */
	total_count: number;

	/**
	 * Requested profile pictures (in up to 4 sizes each)
	 */
	photos: IPhotoSize[][];
}

/**
 * This object represents a file ready to be downloaded. The file can be
 * downloaded via the link
 * https://api.telegram.org/file/bot<token>/<file_path>. It is guaranteed
 * that the link will be valid for at least 1 hour. When the link expires,
 * a new one can be requested by calling getFile.
 * @see https://core.telegram.org/bots/api#getfile
 */
export interface IFile {
	/**
	 * Unique identifier for this file
	 */
	file_id: string;

	/**
	 * File size, if known
	 */
	file_size?: number;

	/**
	 * File path. Use https://api.telegram.org/file/bot<token>/<file_path> to
	 * get the file.
	 */
	file_path?: string;
}

/**
 * This object represents a custom keyboard with reply options (see
 * Introduction to bots for details and examples).
 * @see https://core.telegram.org/bots#keyboards
 */
export interface IReplyKeyboardMarkup {
	/**
	 * Array of button rows, each represented by an Array of KeyboardButton objects
	 * @see https://core.telegram.org/bots/api#keyboardbutton
	 */
	keyboard: IKeyboardButton[][];

	/**
	 * Requests clients to resize the keyboard vertically for optimal fit
	 * (e.g., make the keyboard smaller if there are just two rows of buttons).
	 * Defaults to false, in which case the custom keyboard is always of the
	 * same height as the app's standard keyboard.
	 */
	resize_keyboard?: boolean;

	/**
	 * Requests clients to hide the keyboard as soon as it's been used. The
	 * keyboard will still be available, but clients will automatically display
	 * the usual letter-keyboard in the chat – the user can press a special
	 * button in the input field to see the custom keyboard again. Defaults to false.
	 */
	one_time_keyboard?: boolean;

	/**
	 * Use this parameter if you want to show the keyboard to specific users
	 * only. Targets: 1) users that are @mentioned in the text of the IMessage
	 * object; 2) if the menu's message is a reply (has reply_to_message_id),
	 * sender of the original message.Example: A user requests to change the
	 * menu‘s language, menu replies to the request with a keyboard to select the
	 * new language. Other users in the group don’t see the keyboard.
	 * @see https://core.telegram.org/bots/api#message
	 */
	selective?: boolean;
}

/**
 * This object represents one button of the reply keyboard. For simple text
 * buttons String can be used instead of this object to specify text of the
 * button. Optional fields are mutually exclusive.
 */
export interface IKeyboardButton {
	/**
	 * Text of the button. If none of the optional fields are used, it will be
	 * sent as a message when the button is pressed
	 */
	text: string;

	/**
	 * If True, the user's phone number will be sent as a contact when the
	 * button is pressed. Available in private chats only
	 */
	request_contact?: boolean;

	/**
	 * If True, the user's current location will be sent when the button is
	 * pressed. Available in private chats only
	 */
	request_location?: boolean;
}

/**
 * Upon receiving a message with this object, Telegram clients will remove
 * the current custom keyboard and display the default letter-keyboard. By
 * default, custom keyboards are displayed until a new keyboard is sent by
 * a menu. An exception is made for one-time keyboards that are hidden
 * immediately after the user presses a button (see ReplyKeyboardMarkup).
 * @see https://core.telegram.org/bots/api#replykeyboardmarkup
 */
export interface IReplyKeyboardRemove {
	/**
	 * Requests clients to remove the custom keyboard (user will not be able to
	 * summon this keyboard; if you want to hide the keyboard from sight but
	 * keep it accessible, use one_time_keyboard in ReplyKeyboardMarkup)
	 * @see https://core.telegram.org/bots/api#replykeyboardmarkup
	 */
	remove_keyboard: true;

	/**
	 * Use this parameter if you want to remove the keyboard for specific users
	 * only. Targets: 1) users that are @mentioned in the text of the IMessage
	 * object; 2) if the menu's message is a reply (has reply_to_message_id),
	 * sender of the original message.Example: A user votes in a poll, menu
	 * returns confirmation message in reply to the vote and removes the
	 * keyboard for that user, while still showing the keyboard with poll
	 * options to users who haven't voted yet.
	 * @see https://core.telegram.org/bots/api#message
	 */
	selective?: boolean;
}

/**
 * This object represents an inline keyboard that appears right next to the
 * message it belongs to.
 * @see https://core.telegram.org/bots#inline-keyboards-and-on-the-fly-updating
 */
export interface IInlineKeyboardMarkup {
	/**
	 * Array of button rows, each represented by an Array of
	 * InlineKeyboardButton objects
	 * @see https://core.telegram.org/bots/api#inlinekeyboardbutton
	 */
	inline_keyboard: IInlineKeyboardButton[][];
}

/**
 * This object represents one button of an inline keyboard. You must use
 * exactly one of the optional fields.
 */
export interface IInlineKeyboardButton {
	/**
	 * Label text on the button
	 */
	text: string;

	/**
	 * HTTP url to be opened when button is pressed
	 */
	url?: string;

	/**
	 * Data to be sent in a callback query to the menu when button is pressed,
	 * 1-64 bytes
	 * @see https://core.telegram.org/bots/api#callbackquery
	 */
	callback_data?: string;

	/**
	 * If set, pressing the button will prompt the user to select one of their
	 * chats, open that chat and insert the menu‘s username and the specified
	 * inline query in the input field. Can be empty, in which case just the
	 * menu’s username will be inserted.Note: This offers an easy way for users
	 * to start using your menu in inline mode when they are currently in a
	 * private chat with it. Especially useful when combined with switch_pm…
	 * actions – in this case the user will be automatically returned to the
	 * chat they switched from, skipping the chat selection screen.
	 * @see https://core.telegram.org/bots/api/bots/inline
	 * @see https://core.telegram.org/bots/api#answerinlinequery
	 */
	switch_inline_query?: string;

	/**
	 * If set, pressing the button will insert the menu‘s username and the
	 * specified inline query in the current chat's input field. Can be empty,
	 * in which case only the menu’s username will be inserted.This offers a
	 * quick way for the user to open your menu in inline mode in the same chat
	 * – good for selecting something from multiple options.
	 */
	switch_inline_query_current_chat?: string;

	/**
	 * Specify True, to send a Pay button.NOTE: This type of button must always
	 * be the first button in the first row.
	 * @see https://core.telegram.org/bots/api#payments
	 */
	pay?: boolean;
}

/**
 * This object represents an incoming callback query from a callback button
 * in an inline keyboard. If the button that originated the query was
 * attached to a message sent by the menu, the field message will be
 * present. If the button was attached to a message sent via the menu (in
 * inline mode), the field inline_message_id will be present. Exactly one
 * of the fields data or game_short_name will be present.
 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
 * @see https://core.telegram.org/bots/api#inline-mode
 */
export interface ICallbackQuery {
	/**
	 * Unique identifier for this query
	 */
	id: string;

	/**
	 * Sender
	 */
	from: IUser;

	/**
	 * IMessage with the callback button that originated the query. Note that
	 * message content and message date will not be available if the message is
	 * too old
	 */
	message?: IMessage;

	/**
	 * Identifier of the message sent via the menu in inline mode, that
	 * originated the query.
	 */
	inline_message_id?: string;

	/**
	 * Global identifier, uniquely corresponding to the chat to which the
	 * message with the callback button was sent. Useful for high scores in games.
	 * @see https://core.telegram.org/bots/api#games
	 */
	chat_instance: string;

	/**
	 * Data associated with the callback button. Be aware that a bad client can
	 * send arbitrary data in this field.
	 */
	data?: string;

	/**
	 * Short name of a Game to be returned, serves as the unique identifier for
	 * the game
	 * @see https://core.telegram.org/bots/api#games
	 */
	game_short_name?: string;
}

/**
 * Upon receiving a message with this object, Telegram clients will display
 * a reply interface to the user (act as if the user has selected the menu‘s
 * message and tapped ’Reply'). This can be extremely useful if you want to
 * create user-friendly step-by-step type without having to sacrifice
 * privacy mode.
 * @see https://core.telegram.org/bots/api/bots#privacy-mode
 */
export interface IForceReply {
	/**
	 * Shows reply interface to the user, as if they manually selected the
	 * menu‘s message and tapped ’Reply'
	 */
	force_reply: true;

	/**
	 * Use this parameter if you want to force reply from specific users only.
	 * Targets: 1) users that are @mentioned in the text of the IMessage object;
	 * 2) if the menu's message is a reply (has reply_to_message_id), sender of
	 * the original message.
	 * @see https://core.telegram.org/bots/api#message
	 */
	selective?: boolean;
}

/**
 * This object represents a chat photo.
 */
export interface IChatPhoto {
	/**
	 * Unique file identifier of small (160x160) chat photo. This file_id can
	 * be used only for photo download.
	 */
	small_file_id: string;

	/**
	 * Unique file identifier of big (640x640) chat photo. This file_id can be
	 * used only for photo download.
	 */
	big_file_id: string;
}

/**
 * This object contains information about one member of a chat.
 */
export interface IChatMember {
	/**
	 * Information about the user
	 */
	user: IUser;

	/**
	 * The member's status in the chat. Can be “creator”, “administrator”,
	 * “member”, “restricted”, “left” or “kicked”
	 */
	status: string;

	/**
	 * Restricted and kicked only. Date when restrictions will be lifted for
	 * this user, unix time
	 */
	until_date?: number;

	/**
	 * Administrators only. True, if the menu is allowed to edit administrator
	 * privileges of that user
	 */
	can_be_edited?: boolean;

	/**
	 * Administrators only. True, if the administrator can change the chat
	 * title, photo and other settings
	 */
	can_change_info?: boolean;

	/**
	 * Administrators only. True, if the administrator can post in the channel,
	 * channels only
	 */
	can_post_messages?: boolean;

	/**
	 * Administrators only. True, if the administrator can edit messages of
	 * other users and can pin messages, channels only
	 */
	can_edit_messages?: boolean;

	/**
	 * Administrators only. True, if the administrator can delete messages of
	 * other users
	 */
	can_delete_messages?: boolean;

	/**
	 * Administrators only. True, if the administrator can invite new users to
	 * the chat
	 */
	can_invite_users?: boolean;

	/**
	 * Administrators only. True, if the administrator can restrict, ban or
	 * unban chat members
	 */
	can_restrict_members?: boolean;

	/**
	 * Administrators only. True, if the administrator can pin messages,
	 * supergroups only
	 */
	can_pin_messages?: boolean;

	/**
	 * Administrators only. True, if the administrator can add new
	 * administrators with a subset of his own privileges or demote
	 * administrators that he has promoted, directly or indirectly (promoted by
	 * administrators that were appointed by the user)
	 */
	can_promote_members?: boolean;

	/**
	 * Restricted only. True, if the user can send text messages, contacts,
	 * locations and venues
	 */
	can_send_messages?: boolean;

	/**
	 * Restricted only. True, if the user can send audios, documents, photos,
	 * videos, video notes and voice notes, implies can_send_messages
	 */
	can_send_media_messages?: boolean;

	/**
	 * Restricted only. True, if the user can send animations, games, stickers
	 * and use inline bots, implies can_send_media_messages
	 */
	can_send_other_messages?: boolean;

	/**
	 * Restricted only. True, if user may add web page previews to his
	 * messages, implies can_send_media_messages
	 */
	can_add_web_page_previews?: boolean;
}

/**
 * Contains information about why a request was unsuccessful.
 */
export interface IResponseParameters {
	/**
	 * The group has been migrated to a supergroup with the specified
	 * identifier. This number may be greater than 32 bits and some programming
	 * languages may have difficulty/silent defects in interpreting it. But it
	 * is smaller than 52 bits, so a signed 64 bit integer or double-precision
	 * float type are safe for storing this identifier.
	 */
	migrate_to_chat_id?: number;

	/**
	 * In case of exceeding flood control, the number of seconds left to wait
	 * before the request can be repeated
	 */
	retry_after?: number;
}

/**
 * Represents a photo to be sent.
 */
export interface IInputMediaPhoto {
	/**
	 * Type of the result, must be photo
	 */
	type: string;

	/**
	 * File to send. Pass a file_id to send a file that exists on the Telegram
	 * servers (recommended), pass an HTTP URL for Telegram to get a file from
	 * the Internet, or pass "attach://<file_attach_name>" to upload a new one
	 * using multipart/form-data under <file_attach_name> name. More info on
	 * Sending Files »
	 * @see https://core.telegram.org/bots/api#sending-files
	 */
	media: string;

	/**
	 * Caption of the photo to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;
}

/**
 * Represents a video to be sent.
 */
export interface IInputMediaVideo {
	/**
	 * Type of the result, must be video
	 */
	type: string;

	/**
	 * File to send. Pass a file_id to send a file that exists on the Telegram
	 * servers (recommended), pass an HTTP URL for Telegram to get a file from
	 * the Internet, or pass "attach://<file_attach_name>" to upload a new one
	 * using multipart/form-data under <file_attach_name> name. More info on
	 * Sending Files »
	 * @see https://core.telegram.org/bots/api#sending-files
	 */
	media: string;

	/**
	 * Caption of the video to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Video width
	 */
	width?: number;

	/**
	 * Video height
	 */
	height?: number;

	/**
	 * Video duration
	 */
	duration?: number;

	/**
	 * Pass True, if the uploaded video is suitable for streaming
	 */
	supports_streaming?: boolean;
}

/**
 * This object represents a sticker.
 */
export interface ISticker {
	/**
	 * Unique identifier for this file
	 */
	file_id: string;

	/**
	 * Sticker width
	 */
	width: number;

	/**
	 * Sticker height
	 */
	height: number;

	/**
	 * Sticker thumbnail in the .webp or .jpg format
	 */
	thumb?: IPhotoSize;

	/**
	 * Emoji associated with the sticker
	 */
	emoji?: string;

	/**
	 * Name of the sticker set to which the sticker belongs
	 */
	set_name?: string;

	/**
	 * For mask stickers, the position where the mask should be placed
	 */
	mask_position?: IMaskPosition;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents a sticker set.
 */
export interface IStickerSet {
	/**
	 * Sticker set name
	 */
	name: string;

	/**
	 * Sticker set title
	 */
	title: string;

	/**
	 * True, if the sticker set contains masks
	 */
	contains_masks: boolean;

	/**
	 * List of all set stickers
	 */
	stickers: ISticker[];
}

/**
 * This object describes the position on faces where a mask should be
 * placed by default.
 */
export interface IMaskPosition {
	/**
	 * The part of the face relative to which the mask should be placed. One of
	 * “forehead”, “eyes”, “mouth”, or “chin”.
	 */
	point: string;

	/**
	 * Shift by X-axis measured in widths of the mask scaled to the face size,
	 * from left to right. For example, choosing -1.0 will place mask just to
	 * the left of the default mask position.
	 */
	x_shift: number;

	/**
	 * Shift by Y-axis measured in heights of the mask scaled to the face size,
	 * from top to bottom. For example, 1.0 will place the mask just below the
	 * default mask position.
	 */
	y_shift: number;

	/**
	 * Mask scaling coefficient. For example, 2.0 means double size.
	 */
	scale: number;
}

/**
 * This object represents an incoming inline query. When the user sends an
 * empty query, your menu could return some default or trending results.
 */
export interface IInlineQuery {
	/**
	 * Unique identifier for this query
	 */
	id: string;

	/**
	 * Sender
	 */
	from: IUser;

	/**
	 * Sender location, only for bots that request user location
	 */
	location?: Location;

	/**
	 * Text of the query (up to 512 characters)
	 */
	query: string;

	/**
	 * Offset of the results to be returned, can be controlled by the menu
	 */
	offset: string;
}

/**
 * Represents a link to an article or web page.
 */
export interface IInlineQueryResultArticle {
	/**
	 * Type of the result, must be article
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 Bytes
	 */
	id: string;

	/**
	 * Title of the result
	 */
	title: string;

	/**
	 * Content of the message to be sent
	 */
	input_message_content: InputMessageContent;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * URL of the result
	 */
	url?: string;

	/**
	 * Pass True, if you don't want the URL to be shown in the message
	 */
	hide_url?: boolean;

	/**
	 * Short description of the result
	 */
	description?: string;

	/**
	 * Url of the thumbnail for the result
	 */
	thumb_url?: string;

	/**
	 * Thumbnail width
	 */
	thumb_width?: number;

	/**
	 * Thumbnail height
	 */
	thumb_height?: number;
}

/**
 * Represents a link to a photo. By default, this photo will be sent by the
 * user with optional caption. Alternatively, you can use
 * input_message_content to send a message with the specified content
 * instead of the photo.
 */
export interface IInlineQueryResultPhoto {
	/**
	 * Type of the result, must be photo
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid URL of the photo. Photo must be in jpeg format. Photo size must
	 * not exceed 5MB
	 */
	photo_url: string;

	/**
	 * URL of the thumbnail for the photo
	 */
	thumb_url: string;

	/**
	 * Width of the photo
	 */
	photo_width?: number;

	/**
	 * Height of the photo
	 */
	photo_height?: number;

	/**
	 * Title for the result
	 */
	title?: string;

	/**
	 * Short description of the result
	 */
	description?: string;

	/**
	 * Caption of the photo to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the photo
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to an animated GIF file. By default, this animated GIF
 * file will be sent by the user with optional caption. Alternatively, you
 * can use input_message_content to send a message with the specified
 * content instead of the animation.
 */
export interface IInlineQueryResultGif {
	/**
	 * Type of the result, must be gif
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid URL for the GIF file. File size must not exceed 1MB
	 */
	gif_url: string;

	/**
	 * Width of the GIF
	 */
	gif_width?: number;

	/**
	 * Height of the GIF
	 */
	gif_height?: number;

	/**
	 * Duration of the GIF
	 */
	gif_duration?: number;

	/**
	 * URL of the static thumbnail for the result (jpeg or gif)
	 */
	thumb_url: string;

	/**
	 * Title for the result
	 */
	title?: string;

	/**
	 * Caption of the GIF file to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the GIF animation
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without
 * sound). By default, this animated MPEG-4 file will be sent by the user
 * with optional caption. Alternatively, you can use input_message_content
 * to send a message with the specified content instead of the animation.
 */
export interface IInlineQueryResultMpeg4Gif {
	/**
	 * Type of the result, must be mpeg4_gif
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid URL for the MP4 file. File size must not exceed 1MB
	 */
	mpeg4_url: string;

	/**
	 * Video width
	 */
	mpeg4_width?: number;

	/**
	 * Video height
	 */
	mpeg4_height?: number;

	/**
	 * Video duration
	 */
	mpeg4_duration?: number;

	/**
	 * URL of the static thumbnail (jpeg or gif) for the result
	 */
	thumb_url: string;

	/**
	 * Title for the result
	 */
	title?: string;

	/**
	 * Caption of the MPEG-4 file to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the video animation
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a page containing an embedded video player or a
 * video file. By default, this video file will be sent by the user with an
 * optional caption. Alternatively, you can use input_message_content to
 * send a message with the specified content instead of the video.
 */
export interface IInlineQueryResultVideo {
	/**
	 * Type of the result, must be video
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid URL for the embedded video player or video file
	 */
	video_url: string;

	/**
	 * Mime type of the content of video url, “text/html” or “video/mp4”
	 */
	mime_type: string;

	/**
	 * URL of the thumbnail (jpeg only) for the video
	 */
	thumb_url: string;

	/**
	 * Title for the result
	 */
	title: string;

	/**
	 * Caption of the video to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Video width
	 */
	video_width?: number;

	/**
	 * Video height
	 */
	video_height?: number;

	/**
	 * Video duration in seconds
	 */
	video_duration?: number;

	/**
	 * Short description of the result
	 */
	description?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the video. This field is
	 * required if InlineQueryResultVideo is used to send an HTML-page as a
	 * result (e.g., a YouTube video).
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to an mp3 audio file. By default, this audio file will
 * be sent by the user. Alternatively, you can use input_message_content to
 * send a message with the specified content instead of the audio.
 */
export interface IInlineQueryResultAudio {
	/**
	 * Type of the result, must be audio
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid URL for the audio file
	 */
	audio_url: string;

	/**
	 * Title
	 */
	title: string;

	/**
	 * Caption, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Performer
	 */
	performer?: string;

	/**
	 * Audio duration in seconds
	 */
	audio_duration?: number;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the audio
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a voice recording in an .ogg container encoded with
 * OPUS. By default, this voice recording will be sent by the user.
 * Alternatively, you can use input_message_content to send a message with
 * the specified content instead of the the voice message.
 */
export interface IInlineQueryResultVoice {
	/**
	 * Type of the result, must be voice
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid URL for the voice recording
	 */
	voice_url: string;

	/**
	 * Recording title
	 */
	title: string;

	/**
	 * Caption, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Recording duration in seconds
	 */
	voice_duration?: number;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the voice recording
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a file. By default, this file will be sent by the
 * user with an optional caption. Alternatively, you can use
 * input_message_content to send a message with the specified content
 * instead of the file. Currently, only .PDF and .ZIP files can be sent
 * using this method.
 */
export interface IInlineKeyboardMarkup {
	/**
	 * Type of the result, must be document
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * Title for the result
	 */
	title: string;

	/**
	 * Caption of the document to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * A valid URL for the file
	 */
	document_url: string;

	/**
	 * Mime type of the content of the file, either “application/pdf” or “application/zip”
	 */
	mime_type: string;

	/**
	 * Short description of the result
	 */
	description?: string;

	/**
	 * Inline keyboard attached to the message
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the file
	 */
	input_message_content?: InputMessageContent;

	/**
	 * URL of the thumbnail (jpeg only) for the file
	 */
	thumb_url?: string;

	/**
	 * Thumbnail width
	 */
	thumb_width?: number;

	/**
	 * Thumbnail height
	 */
	thumb_height?: number;
}

/**
 * Represents a location on a map. By default, the location will be sent by
 * the user. Alternatively, you can use input_message_content to send a
 * message with the specified content instead of the location.
 */
export interface IInlineQueryResultLocation {
	/**
	 * Type of the result, must be location
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 Bytes
	 */
	id: string;

	/**
	 * Location latitude in degrees
	 */
	latitude: number;

	/**
	 * Location longitude in degrees
	 */
	longitude: number;

	/**
	 * Location title
	 */
	title: string;

	/**
	 * Period in seconds for which the location can be updated, should be
	 * between 60 and 86400.
	 */
	live_period?: number;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the location
	 */
	input_message_content?: InputMessageContent;

	/**
	 * Url of the thumbnail for the result
	 */
	thumb_url?: string;

	/**
	 * Thumbnail width
	 */
	thumb_width?: number;

	/**
	 * Thumbnail height
	 */
	thumb_height?: number;
}

/**
 * Represents a venue. By default, the venue will be sent by the user.
 * Alternatively, you can use input_message_content to send a message with
 * the specified content instead of the venue.
 */
export interface IInlineQueryResultVenue {
	/**
	 * Type of the result, must be venue
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 Bytes
	 */
	id: string;

	/**
	 * Latitude of the venue location in degrees
	 */
	latitude: number;

	/**
	 * Longitude of the venue location in degrees
	 */
	longitude: number;

	/**
	 * Title of the venue
	 */
	title: string;

	/**
	 * Address of the venue
	 */
	address: string;

	/**
	 * Foursquare identifier of the venue if known
	 */
	foursquare_id?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the venue
	 */
	input_message_content?: InputMessageContent;

	/**
	 * Url of the thumbnail for the result
	 */
	thumb_url?: string;

	/**
	 * Thumbnail width
	 */
	thumb_width?: number;

	/**
	 * Thumbnail height
	 */
	thumb_height?: number;
}

/**
 * Represents a contact with a phone number. By default, this contact will
 * be sent by the user. Alternatively, you can use input_message_content to
 * send a message with the specified content instead of the contact.
 */
export interface IInlineQueryResultVenue {
	/**
	 * Type of the result, must be contact
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 Bytes
	 */
	id: string;

	/**
	 * Contact's phone number
	 */
	phone_number: string;

	/**
	 * Contact's first name
	 */
	first_name: string;

	/**
	 * Contact's last name
	 */
	last_name?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the contact
	 */
	input_message_content?: InputMessageContent;

	/**
	 * Url of the thumbnail for the result
	 */
	thumb_url?: string;

	/**
	 * Thumbnail width
	 */
	thumb_width?: number;

	/**
	 * Thumbnail height
	 */
	thumb_height?: number;
}

/**
 * Represents a Game.
 * @see https://core.telegram.org/bots/api#games
 */
export interface IInlineQueryResultGame {
	/**
	 * Type of the result, must be game
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * Short name of the game
	 */
	game_short_name: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;
}

/**
 * Represents a link to a photo stored on the Telegram servers. By default,
 * this photo will be sent by the user with an optional caption.
 * Alternatively, you can use input_message_content to send a message with
 * the specified content instead of the photo.
 */
export interface IInlineQueryResultCachedPhoto {
	/**
	 * Type of the result, must be photo
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid file identifier of the photo
	 */
	photo_file_id: string;

	/**
	 * Title for the result
	 */
	title?: string;

	/**
	 * Short description of the result
	 */
	description?: string;

	/**
	 * Caption of the photo to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the photo
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to an animated GIF file stored on the Telegram
 * servers. By default, this animated GIF file will be sent by the user
 * with an optional caption. Alternatively, you can use
 * input_message_content to send a message with specified content instead
 * of the animation.
 */
export interface IInlineQueryResultCachedGif {
	/**
	 * Type of the result, must be gif
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid file identifier for the GIF file
	 */
	gif_file_id: string;

	/**
	 * Title for the result
	 */
	title?: string;

	/**
	 * Caption of the GIF file to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the GIF animation
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a video animation (H.264/MPEG-4 AVC video without
 * sound) stored on the Telegram servers. By default, this animated MPEG-4
 * file will be sent by the user with an optional caption. Alternatively,
 * you can use input_message_content to send a message with the specified
 * content instead of the animation.
 */
export interface IInlineQueryResultCachedMpeg4Gif {
	/**
	 * Type of the result, must be mpeg4_gif
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid file identifier for the MP4 file
	 */
	mpeg4_file_id: string;

	/**
	 * Title for the result
	 */
	title?: string;

	/**
	 * Caption of the MPEG-4 file to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the video animation
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a sticker stored on the Telegram servers. By
 * default, this sticker will be sent by the user. Alternatively, you can
 * use input_message_content to send a message with the specified content
 * instead of the sticker.
 */
export interface IInlineQueryResultCachedSticker {
	/**
	 * Type of the result, must be sticker
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid file identifier of the sticker
	 */
	sticker_file_id: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the sticker
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a file stored on the Telegram servers. By default,
 * this file will be sent by the user with an optional caption.
 * Alternatively, you can use input_message_content to send a message with
 * the specified content instead of the file.
 */
export interface IInlineQueryResultCachedDocument {
	/**
	 * Type of the result, must be document
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * Title for the result
	 */
	title: string;

	/**
	 * A valid file identifier for the file
	 */
	document_file_id: string;

	/**
	 * Short description of the result
	 */
	description?: string;

	/**
	 * Caption of the document to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the file
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a video file stored on the Telegram servers. By
 * default, this video file will be sent by the user with an optional
 * caption. Alternatively, you can use input_message_content to send a
 * message with the specified content instead of the video.
 */
export interface IInlineQueryResultCachedVideo {
	/**
	 * Type of the result, must be video
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid file identifier for the video file
	 */
	video_file_id: string;

	/**
	 * Title for the result
	 */
	title: string;

	/**
	 * Short description of the result
	 */
	description?: string;

	/**
	 * Caption of the video to be sent, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the video
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to a voice message stored on the Telegram servers. By
 * default, this voice message will be sent by the user. Alternatively, you
 * can use input_message_content to send a message with the specified
 * content instead of the voice message.
 */
export interface IInlineQueryResultCachedVoice {
	/**
	 * Type of the result, must be voice
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid file identifier for the voice message
	 */
	voice_file_id: string;

	/**
	 * Voice message title
	 */
	title: string;

	/**
	 * Caption, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the voice message
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents a link to an mp3 audio file stored on the Telegram servers.
 * By default, this audio file will be sent by the user. Alternatively, you
 * can use input_message_content to send a message with the specified
 * content instead of the audio.
 */
export interface IInlineQueryResultCachedAudio {
	/**
	 * Type of the result, must be audio
	 */
	type: string;

	/**
	 * Unique identifier for this result, 1-64 bytes
	 */
	id: string;

	/**
	 * A valid file identifier for the audio file
	 */
	audio_file_id: string;

	/**
	 * Caption, 0-200 characters
	 */
	caption?: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in the media caption.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Inline keyboard attached to the message
	 * @see https://core.telegram.org/bots/api/bots#inline-keyboards-and-on-the-fly-updating
	 */
	reply_markup?: IInlineKeyboardMarkup;

	/**
	 * Content of the message to be sent instead of the audio
	 */
	input_message_content?: InputMessageContent;
}

/**
 * Represents the content of a text message to be sent as the result of an
 * inline query.
 * @see https://core.telegram.org/bots/api#inputmessagecontent
 */
export interface IInputTextMessageContent {
	/**
	 * Text of the message to be sent, 1-4096 characters
	 */
	message_text: string;

	/**
	 * Send Markdown or HTML, if you want Telegram apps to show bold, italic,
	 * fixed-width text or inline URLs in your menu's message.
	 * @see https://core.telegram.org/bots/api#markdown-style
	 * @see https://core.telegram.org/bots/api#html-style
	 * @see https://core.telegram.org/bots/api#formatting-options
	 */
	parse_mode?: string;

	/**
	 * Disables link previews for links in the sent message
	 */
	disable_web_page_preview?: boolean;
}

/**
 * Represents the content of a location message to be sent as the result of
 * an inline query.
 * @see https://core.telegram.org/bots/api#inputmessagecontent
 */
export interface IInputLocationMessageContent {
	/**
	 * Latitude of the location in degrees
	 */
	latitude: number;

	/**
	 * Longitude of the location in degrees
	 */
	longitude: number;

	/**
	 * Period in seconds for which the location can be updated, should be
	 * between 60 and 86400.
	 */
	live_period?: number;
}

/**
 * Represents the content of a venue message to be sent as the result of an
 * inline query.
 * @see https://core.telegram.org/bots/api#inputmessagecontent
 */
export interface IInputVenueMessageContent {
	/**
	 * Latitude of the venue in degrees
	 */
	latitude: number;

	/**
	 * Longitude of the venue in degrees
	 */
	longitude: number;

	/**
	 * Name of the venue
	 */
	title: string;

	/**
	 * Address of the venue
	 */
	address: string;

	/**
	 * Foursquare identifier of the venue, if known
	 */
	foursquare_id?: string;
}

/**
 * Represents the content of a contact message to be sent as the result of
 * an inline query.
 * @see https://core.telegram.org/bots/api#inputmessagecontent
 */
export interface IInputContactMessageContent {
	/**
	 * Contact's phone number
	 */
	phone_number: string;

	/**
	 * Contact's first name
	 */
	first_name: string;

	/**
	 * Contact's last name
	 */
	last_name?: string;
}

/**
 * Represents a result of an inline query that was chosen by the user and
 * sent to their chat partner.
 * @see https://core.telegram.org/bots/api#inlinequeryresult
 */
export interface IChosenInlineResult {
	/**
	 * The unique identifier for the result that was chosen
	 */
	result_id: string;

	/**
	 * The user that chose the result
	 */
	from: IUser;

	/**
	 * Sender location, only for bots that require user location
	 */
	location?: Location;

	/**
	 * Identifier of the sent inline message. Available only if there is an
	 * inline keyboard attached to the message. Will be also received in
	 * callback queries and can be used to edit the message.
	 * @see https://core.telegram.org/bots/api#inlinekeyboardmarkup
	 * @see https://core.telegram.org/bots/api#callbackquery
	 * @see https://core.telegram.org/bots/api#updating-messages
	 */
	inline_message_id?: string;

	/**
	 * The query that was used to obtain the result
	 */
	query: string;
}

/**
 * This object represents a portion of the price for goods or services.
 */
export interface ILabeledPrice {
	/**
	 * Portion label
	 */
	label: string;

	/**
	 * Price of the product in the smallest units of the currency (integer, not
	 * float/double). For example, for a price of US$ 1.45 pass amount = 145.
	 * See the exp parameter in currencies.json, it shows the number of digits
	 * past the decimal point for each currency (2 for the majority of currencies).
	 * @see https://core.telegram.org/bots/api/bots/payments#supported-currencies
	 * @see https://core.telegram.org/bots/payments/currencies.json
	 */
	amount: number;
}

/**
 * This object contains basic information about an invoice.
 */
export interface IInvoice {
	/**
	 * Product name
	 */
	title: string;

	/**
	 * Product description
	 */
	description: string;

	/**
	 * Unique menu deep-linking parameter that can be used to generate this invoice
	 */
	start_parameter: string;

	/**
	 * Three-letter ISO 4217 currency code
	 * @see https://core.telegram.org/bots/api/bots/payments#supported-currencies
	 */
	currency: string;

	/**
	 * Total price in the smallest units of the currency (integer, not
	 * float/double). For example, for a price of US$ 1.45 pass amount = 145.
	 * See the exp parameter in currencies.json, it shows the number of digits
	 * past the decimal point for each currency (2 for the majority of currencies).
	 * @see https://core.telegram.org/bots/payments/currencies.json
	 */
	total_amount: number;
}

/**
 * This object represents a shipping address.
 */
export interface IShippingAddress {
	/**
	 * ISO 3166-1 alpha-2 country code
	 */
	country_code: string;

	/**
	 * State, if applicable
	 */
	state: string;

	/**
	 * City
	 */
	city: string;

	/**
	 * First line for the address
	 */
	street_line1: string;

	/**
	 * Second line for the address
	 */
	street_line2: string;

	/**
	 * Address post code
	 */
	post_code: string;
}

/**
 * This object represents information about an order.
 */
export interface IOrderInfo {
	/**
	 * IUser name
	 */
	name?: string;

	/**
	 * IUser's phone number
	 */
	phone_number?: string;

	/**
	 * IUser email
	 */
	email?: string;

	/**
	 * IUser shipping address
	 */
	shipping_address?: IShippingAddress;
}

/**
 * This object represents one shipping option.
 */
export interface IShippingOption {
	/**
	 * Shipping option identifier
	 */
	id: string;

	/**
	 * Option title
	 */
	title: string;

	/**
	 * List of price portions
	 */
	prices: ILabeledPrice[];
}

/**
 * This object contains basic information about a successful payment.
 */
export interface ISuccessfulPayment {
	/**
	 * Three-letter ISO 4217 currency code
	 * @see https://core.telegram.org/bots/api/bots/payments#supported-currencies
	 */
	currency: string;

	/**
	 * Total price in the smallest units of the currency (integer, not
	 * float/double). For example, for a price of US$ 1.45 pass amount = 145.
	 * See the exp parameter in currencies.json, it shows the number of digits
	 * past the decimal point for each currency (2 for the majority of currencies).
	 * @see https://core.telegram.org/bots/payments/currencies.json
	 */
	total_amount: number;

	/**
	 * Bot specified invoice payload
	 */
	invoice_payload: string;

	/**
	 * Identifier of the shipping option chosen by the user
	 */
	shipping_option_id?: string;

	/**
	 * Order info provided by the user
	 */
	order_info?: IOrderInfo;

	/**
	 * Telegram payment identifier
	 */
	telegram_payment_charge_id: string;

	/**
	 * Provider payment identifier
	 */
	provider_payment_charge_id: string;
}

/**
 * This object contains information about an incoming shipping query.
 */
export interface IShippingQuery {
	/**
	 * Unique query identifier
	 */
	id: string;

	/**
	 * IUser who sent the query
	 */
	from: IUser;

	/**
	 * Bot specified invoice payload
	 */
	invoice_payload: string;

	/**
	 * IUser specified shipping address
	 */
	shipping_address: IShippingAddress;
}

/**
 * This object contains information about an incoming pre-checkout query.
 */
export interface IPreCheckoutQuery {
	/**
	 * Unique query identifier
	 */
	id: string;

	/**
	 * IUser who sent the query
	 */
	from: IUser;

	/**
	 * Three-letter ISO 4217 currency code
	 * @see https://core.telegram.org/bots/api/bots/payments#supported-currencies
	 */
	currency: string;

	/**
	 * Total price in the smallest units of the currency (integer, not
	 * float/double). For example, for a price of US$ 1.45 pass amount = 145.
	 * See the exp parameter in currencies.json, it shows the number of digits
	 * past the decimal point for each currency (2 for the majority of currencies).
	 * @see https://core.telegram.org/bots/payments/currencies.json
	 */
	total_amount: number;

	/**
	 * Bot specified invoice payload
	 */
	invoice_payload: string;

	/**
	 * Identifier of the shipping option chosen by the user
	 */
	shipping_option_id?: string;

	/**
	 * Order info provided by the user
	 */
	order_info?: IOrderInfo;
}

/**
 * This object represents a game. Use BotFather to create and edit games,
 * their short names will act as unique identifiers.
 */
export interface IGame {
	/**
	 * Title of the game
	 */
	title: string;

	/**
	 * Description of the game
	 */
	description: string;

	/**
	 * Photo that will be displayed in the game message in chats.
	 */
	photo: IPhotoSize[];

	/**
	 * Brief description of the game or high scores included in the game
	 * message. Can be automatically edited to include current high scores for
	 * the game when the menu calls setGameScore, or manually edited using
	 * editMessageText. 0-4096 characters.
	 * @see https://core.telegram.org/bots/api#setgamescore
	 * @see https://core.telegram.org/bots/api#editmessagetext
	 */
	text?: string;

	/**
	 * Special entities that appear in text, such as usernames, URLs, menu
	 * commands, etc.
	 */
	text_entities?: IMessageEntity[];

	/**
	 * IAnimation that will be displayed in the game message in chats. Upload
	 * via BotFather
	 * @see https://t.me/botfather
	 */
	animation?: IAnimation;
}

/**
 * You can provide an animation for your game so that it looks stylish in
 * chats (check out Lumberjack for an example). This object represents an
 * animation file to be displayed in the message containing a game.
 * @see https://core.telegram.org/bots/api#game
 * @see https://t.me/gamebot
 * @see https://core.telegram.org/bots/api#games
 */
export interface IAnimation {
	/**
	 * Unique file identifier
	 */
	file_id: string;

	/**
	 * IAnimation thumbnail as defined by sender
	 */
	thumb?: IPhotoSize;

	/**
	 * Original animation filename as defined by sender
	 */
	file_name?: string;

	/**
	 * MIME type of the file as defined by sender
	 */
	mime_type?: string;

	/**
	 * File size
	 */
	file_size?: number;
}

/**
 * This object represents one row of the high scores table for a game.
 */
export interface IGameHighScore {
	/**
	 * Position in high score table for the game
	 */
	position: number;

	/**
	 * IUser
	 */
	user: IUser;

	/**
	 * Score
	 */
	score: number;
}

/**
 * Интерфейс меню бота
 */
export interface IMenuBot {
	id: number;
	title: string;
	buttons: IInlineKeyboardButton[][];
}