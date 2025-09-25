import {CustomSelectPrompt} from './CustomSelectPrompt';

const prompt = new CustomSelectPrompt({
    message: 'Select an option:'
});

await prompt.prompt();