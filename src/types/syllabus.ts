export interface Block { type: 'p' | 'li'; text: string }
export interface LearningObjective { id: string; k: string; text: string }
export interface Subsection { number: string; title: string; content: Block[] }
export interface Section { number: string; title: string; learningObjectives: LearningObjective[]; content: Block[]; subsections: Subsection[] }
export interface Chapter { number: string; title: string; minutes: number; sections: Section[] }
export interface Syllabus { version: string; title: string; chapters: Chapter[] }
