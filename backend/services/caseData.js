/**
 * MindMaze Case Data
 * Two complete fictional mystery cases.
 * Solution data is kept server-side; culpritId and explanation use select:false in Mongoose.
 */

const cases = [
  // ============================================================
  // CASE 1: THE VANISHING VIOLIN
  // ============================================================
  {
    caseId: 'case-001',
    title: 'The Vanishing Violin',
    subtitle: 'A Heist at Ashworth Manor',
    description:
      'A priceless Stradivarius violin belonging to the late Lord Ashworth has vanished the night before its scheduled auction. The manor was sealed during a formal dinner. One of the guests is the thief—and possibly something more sinister lurks beneath the surface.',
    difficulty: 'Medium',
    estimatedTime: '35-50 min',
    category: 'Theft',
    setting: 'Victorian manor house, 1920s England',
    crimeSceneDescription:
      'The violin was kept in a locked glass display case in the east wing study. The case was found shattered. Muddy footprints lead toward the servants\' corridor. A torn piece of velvet lies near the window.',
    crimeSceneImageUrl: '/assets/scenes/manor-study.jpg',
    suspects: [
      {
        id: 'suspect-001-1',
        name: 'Eleanor Hargrove',
        age: 34,
        occupation: 'Antique Appraiser',
        background:
          'A respected appraiser hired to evaluate Lord Ashworth\'s estate. Known for her meticulous eye and sharp business instincts. Has worked with high-profile collections across Europe.',
        motive: 'Was passed over for a lucrative commission promised to a rival appraiser.',
        alibi: 'Claims she was in the library the entire evening reading estate documents.',
        imageUrl: '/assets/suspects/eleanor.jpg',
        isGuilty: false,
        statements: [
          'I never left the library after dinner. Anyone who says otherwise is lying.',
          'The violin was already appraised at 1.2 million. I had no reason to steal it.',
          'I heard something at around 10 PM—a faint crash—but assumed it was servants.',
        ],
        revealedByClues: [],
      },
      {
        id: 'suspect-001-2',
        name: 'Victor Ashworth',
        age: 42,
        occupation: 'Heir to the Ashworth Estate',
        background:
          'The nephew and sole heir. Deeply in debt due to gambling habits. Publicly supportive of the auction but privately desperate for immediate cash.',
        motive: 'Enormous gambling debts. Stealing the violin to sell it privately would yield immediate funds before legal inheritance delays.',
        alibi: 'Says he was entertaining guests in the dining room all evening.',
        imageUrl: '/assets/suspects/victor.jpg',
        isGuilty: true, // hidden
        statements: [
          'My uncle\'s legacy means everything to me. I would never dishonour him by stealing.',
          'I was with three guests all evening. They will confirm it.',
          'Eleanor was acting strangely at dinner. Very nervous.',
        ],
        revealedByClues: ['clue-001-4', 'clue-001-6'],
      },
      {
        id: 'suspect-001-3',
        name: 'Mrs. Doris Pemberton',
        age: 58,
        occupation: 'Head Housekeeper',
        background:
          'Has served the Ashworth household for 30 years. Intensely loyal to the late lord but harbouring a long-suppressed secret about the violin\'s true ownership.',
        motive: 'Believed the violin rightfully belonged to her deceased sister, who sold it under duress to Lord Ashworth decades ago.',
        alibi: 'Was supervising the kitchen staff during the relevant time.',
        imageUrl: '/assets/suspects/doris.jpg',
        isGuilty: false,
        statements: [
          'Lord Ashworth was a fair man, but that violin should never have been his.',
          'I was in the kitchen until midnight. Cook Agnes can verify.',
          'Check the study window. I noticed the latch was loose last week.',
        ],
        revealedByClues: ['clue-001-3'],
      },
    ],
    clues: [
      {
        id: 'clue-001-1',
        name: 'Shattered Glass',
        description:
          'The display case glass was broken inward, suggesting the lock was picked rather than the glass struck from outside. Tiny scratches around the keyhole confirm lock-picking.',
        location: 'Display Case',
        type: 'physical',
        isHidden: true,
        xpReward: 50,
        relatedSuspects: [],
        relatedClues: ['clue-001-5'],
        imageHotspot: { x: 38, y: 55, width: 12, height: 10 },
      },
      {
        id: 'clue-001-2',
        name: 'Muddy Footprints',
        description:
          'Size 10 boot prints lead from the east window toward the servants\' corridor. The tread pattern matches expensive riding boots, not servant footwear.',
        location: 'Study Floor',
        type: 'trace',
        isHidden: true,
        xpReward: 50,
        relatedSuspects: ['suspect-001-2'],
        relatedClues: ['clue-001-6'],
        imageHotspot: { x: 60, y: 75, width: 15, height: 8 },
      },
      {
        id: 'clue-001-3',
        name: 'Torn Velvet Glove',
        description:
          'A fragment of dark velvet, consistent with formal evening gloves worn by male guests. A monogram "VA" is partially visible on the cuff.',
        location: 'Near Window Sill',
        type: 'physical',
        isHidden: true,
        xpReward: 75,
        relatedSuspects: ['suspect-001-2'],
        relatedClues: ['clue-001-2'],
        imageHotspot: { x: 82, y: 48, width: 10, height: 8 },
      },
      {
        id: 'clue-001-4',
        name: 'Pawn Shop Receipts',
        description:
          'Three pawn shop receipts found in a wastepaper bin in Victor\'s guest room, totalling £4,200 in pawned jewellery over the past month.',
        location: 'Victor\'s Guest Room',
        type: 'document',
        isHidden: true,
        xpReward: 75,
        relatedSuspects: ['suspect-001-2'],
        relatedClues: ['clue-001-7'],
        imageHotspot: { x: 25, y: 30, width: 15, height: 12 },
      },
      {
        id: 'clue-001-5',
        name: 'Lock-Pick Set',
        description:
          'A professional lock-pick set discovered beneath a floorboard in the east wing corridor. Wrapped in a handkerchief monogrammed "V.A."',
        location: 'East Wing Corridor',
        type: 'physical',
        isHidden: true,
        xpReward: 100,
        relatedSuspects: ['suspect-001-2'],
        relatedClues: ['clue-001-1', 'clue-001-3'],
        imageHotspot: { x: 50, y: 65, width: 12, height: 10 },
      },
      {
        id: 'clue-001-6',
        name: 'Witness Testimony',
        description:
          'Kitchen maid Clara reports seeing Victor Ashworth pass through the servants\' corridor at approximately 9:55 PM, carrying something long wrapped in cloth.',
        location: 'Servants\' Corridor',
        type: 'testimony',
        isHidden: true,
        xpReward: 100,
        relatedSuspects: ['suspect-001-2'],
        relatedClues: ['clue-001-2'],
        imageHotspot: { x: 15, y: 40, width: 20, height: 15 },
      },
      {
        id: 'clue-001-7',
        name: 'Debt Correspondence',
        description:
          'A threatening letter from a creditor demanding £10,000 within 30 days, addressed to Victor Ashworth. Dated two weeks before the theft.',
        location: 'Victor\'s Study Desk',
        type: 'document',
        isHidden: true,
        xpReward: 75,
        relatedSuspects: ['suspect-001-2'],
        relatedClues: ['clue-001-4'],
        imageHotspot: { x: 45, y: 25, width: 18, height: 12 },
      },
    ],
    timelineEvents: [
      {
        id: 'tl-001-1',
        time: '7:00 PM',
        description: 'Dinner begins in the main dining hall. All guests present.',
        correctOrder: 1,
        relatedClues: [],
      },
      {
        id: 'tl-001-2',
        time: '9:30 PM',
        description: 'Victor Ashworth excuses himself from the dining table, citing a headache.',
        correctOrder: 2,
        relatedClues: ['clue-001-6'],
      },
      {
        id: 'tl-001-3',
        time: '9:55 PM',
        description: 'Kitchen maid Clara spots Victor in the servants\' corridor carrying a long cloth-wrapped object.',
        correctOrder: 3,
        relatedClues: ['clue-001-6', 'clue-001-2'],
      },
      {
        id: 'tl-001-4',
        time: '10:00 PM',
        description: 'Faint crash heard from the east wing. Eleanor notes it from the library.',
        correctOrder: 4,
        relatedClues: ['clue-001-1'],
      },
      {
        id: 'tl-001-5',
        time: '10:15 PM',
        description: 'Victor returns to the dining room, appearing flushed. Claims he was in his room.',
        correctOrder: 5,
        relatedClues: [],
      },
      {
        id: 'tl-001-6',
        time: '11:30 PM',
        description: 'Mrs. Pemberton discovers the shattered display case during her nightly rounds.',
        correctOrder: 6,
        relatedClues: ['clue-001-1'],
      },
    ],
    hints: [
      {
        id: 'hint-001-1',
        text: 'Focus on who had both the motive and the opportunity—financial desperation leaves paper trails.',
        order: 1,
        xpPenalty: 30,
      },
      {
        id: 'hint-001-2',
        text: 'The monogrammed items found at the scene are the most incriminating. Cross-reference the initials.',
        order: 2,
        xpPenalty: 50,
      },
      {
        id: 'hint-001-3',
        text: 'The witness testimony places the culprit in the servants\' corridor at the precise time of the theft. Only one suspect cannot account for this gap.',
        order: 3,
        xpPenalty: 75,
      },
    ],
    solution: {
      culpritId: 'suspect-001-2',
      explanation:
        'Victor Ashworth stole the violin. Drowning in £10,000 of gambling debt and with creditors threatening action, he used his knowledge of the manor layout to excuse himself from dinner, pick the study lock with a professional set (hidden under the corridor floor), and carry the violin through the servants\' passage. The monogrammed glove fragment and handkerchief, the pawn shop receipts proving a pattern of financial desperation, the debt letter, and kitchen maid Clara\'s eyewitness account—taken together—form an irrefutable case. His alibi collapses entirely once Clara\'s testimony is obtained.',
      keyEvidence: ['clue-001-3', 'clue-001-5', 'clue-001-6', 'clue-001-4', 'clue-001-7'],
    },
    scoring: {
      baseXP: 600,
      maxScore: 1000,
      timeBonus: true,
    },
    isActive: true,
    tags: ['theft', 'manor', '1920s', 'England', 'classic'],
  },

  // ============================================================
  // CASE 2: THE HEMLOCK CLUB
  // ============================================================
  {
    caseId: 'case-002',
    title: 'The Hemlock Club',
    subtitle: 'A Poisoning at the Gentlemen\'s Society',
    description:
      'Renowned financier Edmund Roth is found dead at his private table in the Hemlock Club, a secretive gentlemen\'s society in the heart of New York, 1947. The medical examiner rules it poisoning. Four members were present that evening. None of them are innocent of secrets.',
    difficulty: 'Hard',
    estimatedTime: '50-70 min',
    category: 'Murder',
    setting: 'Private gentlemen\'s club, New York City, 1947',
    crimeSceneDescription:
      'Edmund Roth was found slumped in his favourite leather chair near the fireplace. A half-finished glass of bourbon sits on the side table. A faint bitter almond scent lingers. The club\'s back bar shows signs of recent disturbance.',
    crimeSceneImageUrl: '/assets/scenes/gentlemens-club.jpg',
    suspects: [
      {
        id: 'suspect-002-1',
        name: 'Margaret Roth',
        age: 39,
        occupation: 'Socialite / Wife of the Victim',
        background:
          'Edmund\'s second wife. Married him six years ago. Known for her cold composure and frequent absences from the marital home.',
        motive: 'Stands to inherit the entire Roth fortune. A secret lover waiting in the wings.',
        alibi: 'Claims to have been at a charity gala across town for the entire evening.',
        imageUrl: '/assets/suspects/margaret.jpg',
        isGuilty: false,
        statements: [
          'Edmund and I had our differences, but I loved him in my way.',
          'I have fifty witnesses who can place me at the Waldorf gala.',
          'Ask Dr. Crane about Edmund\'s enemies. There were many.',
        ],
        revealedByClues: ['clue-002-5'],
      },
      {
        id: 'suspect-002-2',
        name: 'Dr. Theodore Crane',
        age: 55,
        occupation: 'Physician and Club Member',
        background:
          'Edmund\'s personal physician and closest confidant. Has access to a wide range of pharmaceutical substances through his practice.',
        motive: 'Edmund discovered Dr. Crane had been embezzling from a joint medical fund. Roth threatened public exposure.',
        alibi: 'Says he was in the reading room all evening and did not approach Roth\'s table.',
        imageUrl: '/assets/suspects/crane.jpg',
        isGuilty: true, // hidden
        statements: [
          'I have treated Edmund for fifteen years. The idea that I would harm him is obscene.',
          'I was reading all evening. The barman saw me.',
          'Edmund complained of chest pains earlier. This may well be a natural cardiac event.',
        ],
        revealedByClues: ['clue-002-3', 'clue-002-6'],
      },
      {
        id: 'suspect-002-3',
        name: 'Charles Whitmore',
        age: 48,
        occupation: 'Investment Broker',
        background:
          'A club member who had been locked in a business dispute with Roth for two years over a collapsed investment scheme that wiped out Whitmore\'s savings.',
        motive: 'Financial ruin. Blamed Roth for deliberately sabotaging his investment fund.',
        alibi: 'Played billiards with another member, Raymond Holt, until 10 PM.',
        imageUrl: '/assets/suspects/whitmore.jpg',
        isGuilty: false,
        statements: [
          'Roth destroyed me financially. I\'m not ashamed to say I hated him.',
          'But I\'m not a murderer. Raymond can vouch for me.',
          'Check the bourbon. Something was wrong with it.',
        ],
        revealedByClues: [],
      },
      {
        id: 'suspect-002-4',
        name: 'James "Jimmy" Fallon',
        age: 29,
        occupation: 'Club Barman',
        background:
          'The club\'s long-serving barman. Quiet, observant, and privy to every conversation in the room. Has a sealed juvenile record.',
        motive: 'Edmund had discovered Jimmy\'s criminal past and was blackmailing him for free service and silence.',
        alibi: 'Was behind the bar for the entire evening. Multiple members can confirm.',
        imageUrl: '/assets/suspects/jimmy.jpg',
        isGuilty: false,
        statements: [
          'Mr. Roth was fine when I brought him his bourbon at 9 PM.',
          'Dr. Crane was at the bar around 9:30. Came to get a brandy, he said.',
          'Nobody else went near Mr. Roth\'s table that night. Nobody but the doctor.',
        ],
        revealedByClues: ['clue-002-2', 'clue-002-7'],
      },
    ],
    clues: [
      {
        id: 'clue-002-1',
        name: 'Bitter Almond Residue',
        description:
          'The bourbon glass tests positive for cyanide compounds. The toxicology profile is consistent with potassium cyanide, which acts rapidly and is available through medical suppliers.',
        location: 'Victim\'s Bourbon Glass',
        type: 'physical',
        isHidden: true,
        xpReward: 75,
        relatedSuspects: ['suspect-002-2'],
        relatedClues: ['clue-002-4'],
        imageHotspot: { x: 55, y: 60, width: 12, height: 10 },
      },
      {
        id: 'clue-002-2',
        name: 'Bar Access Log',
        description:
          'The club maintains a member bar-access ledger. Dr. Crane signed out a private bottle of brandy at 9:28 PM—four minutes before Edmund collapsed.',
        location: 'Back Bar Ledger',
        type: 'document',
        isHidden: true,
        xpReward: 100,
        relatedSuspects: ['suspect-002-2'],
        relatedClues: ['clue-002-1'],
        imageHotspot: { x: 20, y: 35, width: 18, height: 12 },
      },
      {
        id: 'clue-002-3',
        name: 'Medical Supply Receipt',
        description:
          'A receipt in Dr. Crane\'s coat pocket for 10g of potassium cyanide, purchased three days prior from a medical supply company using the clinic\'s account.',
        location: 'Dr. Crane\'s Coat (Cloakroom)',
        type: 'document',
        isHidden: true,
        xpReward: 100,
        relatedSuspects: ['suspect-002-2'],
        relatedClues: ['clue-002-1', 'clue-002-4'],
        imageHotspot: { x: 30, y: 45, width: 20, height: 12 },
      },
      {
        id: 'clue-002-4',
        name: 'Empty Vial',
        description:
          'A small glass vial found tucked behind a bar shelf near where Crane was standing. Traces of cyanide compound inside. Wiped but not perfectly clean.',
        location: 'Behind the Bar',
        type: 'physical',
        isHidden: true,
        xpReward: 100,
        relatedSuspects: ['suspect-002-2'],
        relatedClues: ['clue-002-1', 'clue-002-3'],
        imageHotspot: { x: 70, y: 50, width: 10, height: 8 },
      },
      {
        id: 'clue-002-5',
        name: 'Embezzlement Ledger',
        description:
          'A coded ledger found in Edmund Roth\'s personal safe reveals systematic withdrawals from a joint medical fund—all attributed to Dr. Crane\'s account—totalling $47,000 over two years.',
        location: 'Victim\'s Office Safe',
        type: 'document',
        isHidden: true,
        xpReward: 75,
        relatedSuspects: ['suspect-002-2'],
        relatedClues: ['clue-002-6'],
        imageHotspot: { x: 40, y: 30, width: 16, height: 12 },
      },
      {
        id: 'clue-002-6',
        name: 'Confrontation Note',
        description:
          'A handwritten note in the victim\'s diary: "Confronted TC tonight. He begged for silence. I gave him until the end of the month." Dated eight days before his death.',
        location: 'Victim\'s Personal Diary',
        type: 'document',
        isHidden: true,
        xpReward: 75,
        relatedSuspects: ['suspect-002-2'],
        relatedClues: ['clue-002-5'],
        imageHotspot: { x: 25, y: 55, width: 18, height: 10 },
      },
      {
        id: 'clue-002-7',
        name: 'Barman\'s Testimony',
        description:
          'Jimmy Fallon states under questioning that Dr. Crane lingered near Roth\'s usual table at approximately 9:25 PM, before Edmund arrived to take his seat and before Jimmy brought the bourbon.',
        location: 'Club Bar (Witness Statement)',
        type: 'testimony',
        isHidden: true,
        xpReward: 75,
        relatedSuspects: ['suspect-002-2'],
        relatedClues: ['clue-002-2', 'clue-002-4'],
        imageHotspot: { x: 10, y: 60, width: 22, height: 14 },
      },
    ],
    timelineEvents: [
      {
        id: 'tl-002-1',
        time: '8:30 PM',
        description: 'Members gather for the evening. Edmund Roth arrives and greets the room.',
        correctOrder: 1,
        relatedClues: [],
      },
      {
        id: 'tl-002-2',
        time: '9:15 PM',
        description: 'Dr. Crane and Edmund exchange a private, heated word near the fireplace.',
        correctOrder: 2,
        relatedClues: ['clue-002-6'],
      },
      {
        id: 'tl-002-3',
        time: '9:25 PM',
        description: 'Dr. Crane lingers near Edmund\'s usual chair while Edmund is at the bar.',
        correctOrder: 3,
        relatedClues: ['clue-002-7', 'clue-002-4'],
      },
      {
        id: 'tl-002-4',
        time: '9:28 PM',
        description: 'Dr. Crane visits the back bar and signs the access ledger for a brandy.',
        correctOrder: 4,
        relatedClues: ['clue-002-2'],
      },
      {
        id: 'tl-002-5',
        time: '9:30 PM',
        description: 'Jimmy delivers Edmund\'s bourbon to his table. Edmund sits and begins drinking.',
        correctOrder: 5,
        relatedClues: ['clue-002-1'],
      },
      {
        id: 'tl-002-6',
        time: '9:32 PM',
        description: 'Edmund Roth is found slumped in his chair, unresponsive. He is pronounced dead within minutes.',
        correctOrder: 6,
        relatedClues: ['clue-002-1'],
      },
    ],
    hints: [
      {
        id: 'hint-002-1',
        text: 'The poison was cyanide—a substance requiring specific medical or laboratory access. Consider who among the suspects could easily obtain it.',
        order: 1,
        xpPenalty: 30,
      },
      {
        id: 'hint-002-2',
        text: 'The bar access ledger places someone at a critical location at the critical time. The timeline matters greatly in this case.',
        order: 2,
        xpPenalty: 50,
      },
      {
        id: 'hint-002-3',
        text: 'Edmund\'s own diary and safe contain the motive. The receipt in the cloakroom provides the means. The barman\'s testimony closes the opportunity gap. One suspect satisfies all three.',
        order: 3,
        xpPenalty: 75,
      },
    ],
    solution: {
      culpritId: 'suspect-002-2',
      explanation:
        'Dr. Theodore Crane poisoned Edmund Roth with potassium cyanide. Having embezzled $47,000 from their joint medical fund and facing exposure—Edmund had given him a deadline—Crane purchased cyanide three days before the murder. On the evening in question, he lingered near Edmund\'s chair before Edmund arrived, slipping the poison into the glass. He then visited the back bar to establish an alibi movement, but the signed ledger, the empty vial behind the bar shelf, the cyanide purchase receipt, and the barman\'s precise account of his movements make his guilt unambiguous. Margaret\'s alibi is solid; Whitmore was in the billiard room; Jimmy had no motive strong enough and was visible all evening.',
      keyEvidence: ['clue-002-1', 'clue-002-2', 'clue-002-3', 'clue-002-4', 'clue-002-5', 'clue-002-6'],
    },
    scoring: {
      baseXP: 800,
      maxScore: 1200,
      timeBonus: true,
    },
    isActive: true,
    tags: ['murder', 'poison', '1940s', 'New York', 'noir'],
  },
];

module.exports = cases;
