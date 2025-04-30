export type Preset = {
  name: string;
  description: string;
  notes: number[][];
};

export const DEFAULT_PRESETS: Preset[] = [
  {
    name: "Major Triads",
    description: "Standard major triads",
    notes: [
      [60, 64, 67], // C4, E4, G4
      [62, 65, 69], // D4, F4, A4
      [64, 67, 71], // E4, G4, B4
      [65, 69, 72], // F4, A4, C5
      [67, 71, 74], // G4, B4, D5
      [69, 72, 76], // A4, C5, E5
      [71, 74, 77], // B4, D5, F5
      [72, 76, 79], // C5, E5, G5
    ],
  },
  {
    name: "Minor Triads",
    description: "Standard minor triads",
    notes: [
      [60, 63, 67], // C4, D#4, G4
      [62, 65, 68], // D4, F4, G#4
      [64, 67, 70], // E4, G4, A#4
      [65, 68, 72], // F4, G#4, C5
      [67, 70, 74], // G4, A#4, D5
      [69, 72, 75], // A4, C5, D#5
      [71, 74, 77], // B4, D5, F5
      [72, 75, 79], // C5, D#5, G5
    ],
  },
];

export const TEMPLATE_PRESETS: Preset[] = [
  {
    name: "Major Triads",
    description: "Standard major triads",
    notes: [
      [60, 64, 67], // C4, E4, G4
      [62, 65, 69], // D4, F4, A4
      [64, 67, 71], // E4, G4, B4
      [65, 69, 72], // F4, A4, C5
      [67, 71, 74], // G4, B4, D5
      [69, 72, 76], // A4, C5, E5
      [71, 74, 77], // B4, D5, F5
      [72, 76, 79], // C5, E5, G5
    ],
  },
  {
    name: "Minor Triads",
    description: "Standard minor triads",
    notes: [
      [60, 63, 67], // C4, D#4, G4
      [62, 65, 68], // D4, F4, G#4
      [64, 67, 70], // E4, G4, A#4
      [65, 68, 72], // F4, G#4, C5
      [67, 70, 74], // G4, A#4, D5
      [69, 72, 75], // A4, C5, D#5
      [71, 74, 77], // B4, D5, F5
      [72, 75, 79], // C5, D#5, G5
    ],
  },
  {
    name: "Jazzy 7ths",
    description: "Dominant 7th chords for jazz",
    notes: [
      [60, 64, 67, 70], // C7 (C, E, G, B♭)
      [62, 66, 69, 72], // D7 (D, F#, A, C)
      [64, 68, 71, 74], // E7 (E, G#, B, D)
      [65, 69, 72, 75], // F7 (F, A, C, E♭)
      [67, 71, 74, 77], // G7 (G, B, D, F)
      [69, 73, 76, 79], // A7 (A, C#, E, G)
      [71, 75, 78, 81], // B7 (B, D#, F#, A)
      [72, 76, 79, 82], // C7 (C, E, G, B♭)
    ],
  },
  {
    name: "Power Chords",
    description: "Rock power chords (root + 5th)",
    notes: [
      [60, 67], // C5 (C, G)
      [62, 69], // D5 (D, A)
      [64, 71], // E5 (E, B)
      [65, 72], // F5 (F, C)
      [67, 74], // G5 (G, D)
      [69, 76], // A5 (A, E)
      [71, 78], // B5 (B, F#)
      [72, 79], // C6 (C, G)
    ],
  },
  {
    name: "Suspended",
    description: "Dreamy suspended chords",
    notes: [
      [60, 65, 67], // Csus4 (C, F, G)
      [62, 67, 69], // Dsus4 (D, G, A)
      [64, 69, 71], // Esus4 (E, A, B)
      [65, 70, 72], // Fsus4 (F, B♭, C)
      [67, 72, 74], // Gsus4 (G, C, D)
      [69, 74, 76], // Asus4 (A, D, E)
      [71, 76, 78], // Bsus4 (B, E, F#)
      [72, 77, 79], // Csus4 (C, F, G)
    ],
  },
  {
    name: "Diminished",
    description: "Spooky diminished chords",
    notes: [
      [60, 63, 66], // Cdim (C, E♭, G♭)
      [62, 65, 68], // Ddim (D, F, A♭)
      [64, 67, 70], // Edim (E, G, B♭)
      [65, 68, 71], // Fdim (F, A♭, B)
      [67, 70, 73], // Gdim (G, B♭, D♭)
      [69, 72, 75], // Adim (A, C, E♭)
      [71, 74, 77], // Bdim (B, D, F)
      [72, 75, 78], // Cdim (C, E♭, G♭)
    ],
  },
  {
    name: "Augmented",
    description: "Dramatic augmented chords",
    notes: [
      [60, 64, 68], // Caug (C, E, G#)
      [62, 66, 70], // Daug (D, F#, A#)
      [64, 68, 72], // Eaug (E, G#, C)
      [65, 69, 73], // Faug (F, A, C#)
      [67, 71, 75], // Gaug (G, B, D#)
      [69, 73, 77], // Aaug (A, C#, F)
      [71, 75, 79], // Baug (B, D#, G)
      [72, 76, 80], // Caug (C, E, G#)
    ],
  },
  {
    name: "Soul 9ths",
    description: "Rich 9th chords for R&B",
    notes: [
      [60, 64, 67, 70, 74], // C9 (C, E, G, B♭, D)
      [62, 66, 69, 72, 76], // D9 (D, F#, A, C, E)
      [64, 68, 71, 74, 78], // E9 (E, G#, B, D, F#)
      [65, 69, 72, 75, 79], // F9 (F, A, C, E♭, G)
      [67, 71, 74, 77, 81], // G9 (G, B, D, F, A)
      [69, 73, 76, 79, 83], // A9 (A, C#, E, G, B)
      [71, 75, 78, 81, 85], // B9 (B, D#, F#, A, C#)
      [72, 76, 79, 82, 86], // C9 (C, E, G, B♭, D)
    ],
  },
  {
    name: "Empty Preset",
    description: "Make your own!",
    notes: [[], [], [], [], [], [], [], []],
  },
];
