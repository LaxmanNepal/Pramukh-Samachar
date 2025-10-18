
import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [status, setStatus] = useState('');

    const synth = window.speechSynthesis;

    const populateVoiceList = useCallback(() => {
        const availableVoices = synth.getVoices();
        const nepaliVoices = availableVoices.filter(v => v.lang.includes('ne') || v.lang.includes('hi'));
        const finalVoices = nepaliVoices.length > 0 ? nepaliVoices : availableVoices;
        setVoices(finalVoices);
        if (finalVoices.length > 0 && !selectedVoice) {
            setSelectedVoice(finalVoices[0]);
        }
    }, [synth, selectedVoice]);
    
    useEffect(() => {
        populateVoiceList();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = populateVoiceList;
        }
    }, [populateVoiceList, synth]);

    const play = useCallback((text: string, onEnd: () => void, onBoundary: (e: SpeechSynthesisEvent) => void) => {
        if (!synth || isPlaying) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        utterance.voice = selectedVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        
        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
            setStatus('समाचार सुनाईदै...');
        };
        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
            utteranceRef.current = null;
            setStatus('समाप्त भयो');
            onEnd();
        };
        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            setIsPlaying(false);
            setIsPaused(false);
            setStatus(`त्रुटि: ${e.error}`);
        };
        utterance.onboundary = onBoundary;

        synth.speak(utterance);
    }, [synth, isPlaying, selectedVoice]);

    const pause = useCallback(() => {
        if (isPlaying && !isPaused) {
            synth.pause();
            setIsPaused(true);
            setStatus('पौज गरिएको');
        }
    }, [synth, isPlaying, isPaused]);

    const resume = useCallback(() => {
        if (isPaused) {
            synth.resume();
            setIsPaused(false);
            setStatus('समाचार सुनाईदै...');
        }
    }, [synth, isPaused]);

    const stop = useCallback(() => {
        if (isPlaying) {
            synth.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            setStatus('रोकिएको');
        }
    }, [synth, isPlaying]);

    return { voices, selectedVoice, setSelectedVoice, play, pause, resume, stop, isPlaying, isPaused, status };
};

export default useSpeechSynthesis;
