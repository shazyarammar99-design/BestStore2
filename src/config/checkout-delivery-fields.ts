export type DeliveryFieldDef = {
  id: string;
  labelKey: string;
  placeholderKey: string;
  required: boolean;
  inputType?: 'text' | 'email';
};

const DEFAULT_FIELDS: DeliveryFieldDef[] = [
  {
    id: 'delivery_contact',
    labelKey: 'deliveryFields.deliveryContact',
    placeholderKey: 'deliveryFields.deliveryContactPlaceholder',
    required: true,
    inputType: 'text',
  },
];

const CATEGORY_FIELDS: Record<string, DeliveryFieldDef[]> = {
  'in-game-currency': [
    {
      id: 'contact_email',
      labelKey: 'deliveryFields.contactEmail',
      placeholderKey: 'deliveryFields.contactEmailPlaceholder',
      required: true,
      inputType: 'email',
    },
    {
      id: 'account_username',
      labelKey: 'deliveryFields.accountUsername',
      placeholderKey: 'deliveryFields.accountUsernamePlaceholder',
      required: false,
    },
  ],
  'bypass-pubg': [
    {
      id: 'player_id',
      labelKey: 'deliveryFields.playerId',
      placeholderKey: 'deliveryFields.playerIdPlaceholder',
      required: true,
    },
    {
      id: 'in_game_nickname',
      labelKey: 'deliveryFields.nickname',
      placeholderKey: 'deliveryFields.nicknamePlaceholder',
      required: false,
    },
  ],
  'steam-games': [
    {
      id: 'steam_username',
      labelKey: 'deliveryFields.steamUsername',
      placeholderKey: 'deliveryFields.steamUsernamePlaceholder',
      required: true,
    },
    {
      id: 'contact_email',
      labelKey: 'deliveryFields.contactEmail',
      placeholderKey: 'deliveryFields.contactEmailPlaceholder',
      required: true,
      inputType: 'email',
    },
  ],
};

export function getDeliveryFieldsForCategories(categoryIds: string[]): DeliveryFieldDef[] {
  const seen = new Set<string>();
  const fields: DeliveryFieldDef[] = [];

  const add = (list: DeliveryFieldDef[]) => {
    for (const field of list) {
      if (!seen.has(field.id)) {
        seen.add(field.id);
        fields.push(field);
      }
    }
  };

  for (const categoryId of categoryIds) {
    if (CATEGORY_FIELDS[categoryId]) {
      add(CATEGORY_FIELDS[categoryId]);
    }
  }

  if (fields.length === 0) {
    add(DEFAULT_FIELDS);
  }

  return fields;
}
