import { SelectableGroup } from '@yuuvis/framework';

// test data with just labels
export const DATA_GROUPS: SelectableGroup[] = [
  {
    id: '0',
    label: '0 - Computers',
    items: [
      {
        id: '0_0',
        label: 'Pizza'
      },
      {
        id: '0_1',
        label: 'yuvBall'
      },
      {
        id: '0_2',
        label: 'yuvComputer'
      },
      {
        id: '0_3',
        label: 'Tuna'
      },
      {
        id: '0_4',
        label: 'Gloves'
      },
      {
        id: '0_5',
        label: 'Table'
      },
      {
        id: '0_6',
        label: 'Car'
      },
      {
        id: '0_7',
        label: 'Mouse'
      },
      {
        id: '0_8',
        label: 'Computer'
      },
      {
        id: '0_9',
        label: 'Chair'
      }
    ]
  },
  {
    id: '1',
    label: '1 - Health',
    items: [
      {
        id: '1_0',
        label: 'yuvCheese'
      },
      {
        id: '1_1',
        label: 'Car'
      },
      {
        id: '1_2',
        label: 'Soap'
      },
      {
        id: '1_3',
        label: 'Table'
      }
    ]
  },
  {
    id: '2',
    label: '2 - Movies',
    items: [
      {
        id: '2_0',
        label: 'yuvShoes'
      },
      {
        id: '2_1',
        label: 'Chicken'
      },
      {
        id: '2_2',
        label: 'Towels'
      },
      {
        id: '2_3',
        label: 'Bacon'
      },
      {
        id: '2_4',
        label: 'Table'
      },
      {
        id: '2_5',
        label: 'Bacon'
      }
    ]
  },
  {
    id: '3',
    label: '3 - Books',
    items: [
      {
        id: '3_0',
        label: 'Gloves'
      },
      {
        id: '3_1',
        label: 'Chair'
      },
      {
        id: '3_2',
        label: 'Table'
      },
      {
        id: '3_3',
        label: 'Chair'
      },
      {
        id: '3_4',
        label: 'Salad'
      },
      {
        id: '3_5',
        label: 'Sausages'
      },
      {
        id: '3_6',
        label: 'Cheese'
      },
      {
        id: '3_7',
        label: 'Table'
      }
    ]
  },
  {
    id: '4',
    label: '4 - Books',
    items: [
      {
        id: '4_0',
        label: 'Bike'
      },
      {
        id: '4_1',
        label: 'Shoes'
      }
    ]
  },
  {
    id: '5',
    label: '5 - Toys',
    items: [
      {
        id: '5_0',
        label: 'Mouse'
      },
      {
        id: '5_1',
        label: 'Shoes'
      },
      {
        id: '5_2',
        label: 'Gloves'
      },
      {
        id: '5_3',
        label: 'Chair'
      },
      {
        id: '5_4',
        label: 'Fish'
      },
      {
        id: '5_5',
        label: 'Pants'
      },
      {
        id: '5_6',
        label: 'Soap'
      },
      {
        id: '5_7',
        label: 'Towels'
      },
      {
        id: '5_8',
        label: 'Pizza'
      },
      {
        id: '5_9',
        label: 'Keyboard'
      },
      {
        id: '5_10',
        label: 'Hat'
      },
      {
        id: '5_11',
        label: 'Shirt'
      }
    ]
  },
  {
    id: '6',
    label: '6 - Sports',
    items: [
      {
        id: '6_0',
        label: 'Chair'
      },
      {
        id: '6_1',
        label: 'Keyboard'
      },
      {
        id: '6_2',
        label: 'Ball'
      },
      {
        id: '6_3',
        label: 'Table'
      }
    ]
  },
  {
    id: '7',
    label: '7 - Clothing',
    items: [
      {
        id: '7_0',
        label: 'Soap'
      },
      {
        id: '7_1',
        label: 'Table'
      },
      {
        id: '7_2',
        label: 'Pizza'
      },
      {
        id: '7_3',
        label: 'Ball'
      },
      {
        id: '7_4',
        label: 'Gloves'
      },
      {
        id: '7_5',
        label: 'Soap'
      },
      {
        id: '7_6',
        label: 'Cheese'
      },
      {
        id: '7_7',
        label: 'Mouse'
      }
    ]
  }
];

// test data including description, highlight and icons
export const DATA_GROUPS_FULL: SelectableGroup[] = [
  {
    id: '0',
    label: '0 - Toys',
    items: [
      {
        id: '0_0',
        label: 'Gloves',
        description: 'Licensed Metal Ball',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: true
      },
      {
        id: '0_1',
        label: 'Shoes',
        description: 'Incredible Soft Mouse',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: true
      },
      {
        id: '0_2',
        label: 'Shirt',
        description: 'Unbranded Metal Chips',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '0_3',
        label: 'Chair',
        description: 'Awesome Wooden Computer',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '0_4',
        label: 'Fish',
        description: 'Unbranded Concrete Keyboard',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '0_5',
        label: 'Sausages',
        description: 'Handcrafted Cotton Salad',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '0_6',
        label: 'Salad',
        description: 'Awesome Concrete Towels',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '0_7',
        label: 'Towels',
        description: 'Handcrafted Soft Bacon',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '0_8',
        label: 'Tuna',
        description: 'Small Frozen Hat',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '0_9',
        label: 'Car',
        description: 'Intelligent Granite Ball',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  },
  {
    id: '1',
    label: '1 - Jewelery',
    items: [
      {
        id: '1_0',
        label: 'Car',
        description: 'Generic Steel Chips',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '1_1',
        label: 'Gloves',
        description: 'Small Fresh Car',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '1_2',
        label: 'Bacon',
        description: 'Handcrafted Fresh Soap',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '1_3',
        label: 'Shirt',
        description: 'Awesome Plastic Cheese',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  },
  {
    id: '2',
    label: '2 - Electronics',
    items: [
      {
        id: '2_0',
        label: 'Computer',
        description: 'Handmade Concrete Salad',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '2_1',
        label: 'Bacon',
        description: 'Fantastic Steel Cheese',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '2_2',
        label: 'Mouse',
        description: 'Gorgeous Soft Table',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '2_3',
        label: 'Table',
        description: 'Intelligent Granite Chicken',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '2_4',
        label: 'Computer',
        description: 'Rustic Steel Keyboard',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '2_5',
        label: 'Car',
        description: 'Intelligent Metal Sausages',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  },
  {
    id: '3',
    label: '3 - Baby',
    items: [
      {
        id: '3_0',
        label: 'Fish',
        description: 'Sleek Rubber Shoes',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '3_1',
        label: 'Chicken',
        description: 'Fantastic Steel Sausages',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '3_2',
        label: 'Computer',
        description: 'Handmade Soft Pizza',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '3_3',
        label: 'Cheese',
        description: 'Small Granite Soap',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '3_4',
        label: 'Table',
        description: 'Small Granite Soap',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '3_5',
        label: 'Computer',
        description: 'Ergonomic Soft Chips',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '3_6',
        label: 'Shirt',
        description: 'Small Concrete Pizza',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '3_7',
        label: 'Ball',
        description: 'Handmade Wooden Pizza',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  },
  {
    id: '4',
    label: '4 - Beauty',
    items: [
      {
        id: '4_0',
        label: 'Gloves',
        description: 'Handmade Concrete Chicken',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '4_1',
        label: 'Pizza',
        description: 'Unbranded Rubber Fish',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  },
  {
    id: '5',
    label: '5 - Garden',
    items: [
      {
        id: '5_0',
        label: 'Shirt',
        description: 'Licensed Steel Chair',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_1',
        label: 'Pants',
        description: 'Sleek Granite Bike',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_2',
        label: 'Gloves',
        description: 'Awesome Soft Mouse',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_3',
        label: 'Computer',
        description: 'Awesome Granite Chair',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_4',
        label: 'Pants',
        description: 'Incredible Cotton Shirt',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_5',
        label: 'Computer',
        description: 'Unbranded Concrete Car',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_6',
        label: 'Mouse',
        description: 'Gorgeous Rubber Hat',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_7',
        label: 'Mouse',
        description: 'Handcrafted Wooden Bike',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_8',
        label: 'Hat',
        description: 'Licensed Fresh Pizza',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_9',
        label: 'Towels',
        description: 'Generic Plastic Shirt',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_10',
        label: 'Ball',
        description: 'Gorgeous Rubber Towels',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '5_11',
        label: 'Ball',
        description: 'Handcrafted Frozen Salad',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  },
  {
    id: '6',
    label: '6 - Music',
    items: [
      {
        id: '6_0',
        label: 'Ball',
        description: 'Practical Concrete Shirt',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '6_1',
        label: 'Fish',
        description: 'Fantastic Cotton Bike',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '6_2',
        label: 'Chicken',
        description: 'Rustic Cotton Car',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '6_3',
        label: 'Chips',
        description: 'Handmade Rubber Car',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  },
  {
    id: '7',
    label: '7 - Movies',
    items: [
      {
        id: '7_0',
        label: 'Salad',
        description: 'Gorgeous Plastic Keyboard',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '7_1',
        label: 'Sausages',
        description: 'Rustic Metal Shoes',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '7_2',
        label: 'Keyboard',
        description: 'Handcrafted Cotton Ball',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '7_3',
        label: 'Towels',
        description: 'Refined Rubber Bike',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '7_4',
        label: 'Pizza',
        description: 'Rustic Wooden Hat',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '7_5',
        label: 'Sausages',
        description: 'Tasty Fresh Mouse',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '7_6',
        label: 'Computer',
        description: 'Generic Plastic Chicken',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      },
      {
        id: '7_7',
        label: 'Fish',
        description: 'Handmade Rubber Pizza',
        svg:
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
        highlight: false
      }
    ]
  }
];
