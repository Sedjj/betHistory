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
 * Интерфейс меню бота
 */
export interface IMenuBot {
	id: number;
	title: string;
	buttons: IInlineKeyboardButton[][];
}

/**
 * Интерфейс файла для Nest controller
 */
export type FilePhoto = {
	/** Field name specified in the form */
	fieldname: string;
	/** Name of the file on the user's computer */
	originalname: string;
	/** Encoding type of the file */
	encoding: string;
	/** Mime type of the file */
	mimetype: string;
	/** Size of the file in bytes */
	size: number;
	/** The folder to which the file has been saved (DiskStorage) */
	destination: string;
	/** The name of the file within the destination (DiskStorage) */
	filename: string;
	/** Location of the uploaded file (DiskStorage) */
	path: string;
	/** A Buffer of the entire file (MemoryStorage) */
	buffer: Buffer;
};
