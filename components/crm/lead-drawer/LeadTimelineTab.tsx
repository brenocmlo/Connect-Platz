"use client";

import React, { useState, useRef } from "react";
import { Mic, Square, Send, MessageSquare } from "lucide-react";

export interface TimelineEntry {
  id: string;
  tipo: "nota" | "audio" | "status_change" | "visita";
  conteudo: string;
  audioUrl?: string;
  duracaoSegundos?: number;
  autor: string;
  createdAt: string;
}

export function LeadTimelineTab() {
  const [newNote, setNewNote] = useState("");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([
    {
      id: "t1",
      tipo: "status_change",
      conteudo: "Lead entrou no funil via Webhook Meta Ads e foi atribuído via Roleta Round-Robin.",
      autor: "Sistema Automático",
      createdAt: "Hoje às 10:15",
    },
    {
      id: "t2",
      tipo: "nota",
      conteudo: "Cliente manifestou interesse na unidade de 3 suítes frente mar do Villa Platz Beach. Prefere contato após as 18h.",
      autor: "Corretor Titular",
      createdAt: "Hoje às 11:30",
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newEntry: TimelineEntry = {
          id: `audio-${Date.now()}`,
          tipo: "audio",
          conteudo: "Mensagem de voz gravada pelo corretor:",
          audioUrl,
          duracaoSegundos: recordingDuration,
          autor: "Corretor Titular",
          createdAt: "Agora mesmo",
        };
        setTimeline((prev) => [newEntry, ...prev]);
        setRecordingDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Permissão de microfone necessária para gravar notas de voz.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const entry: TimelineEntry = {
      id: `note-${Date.now()}`,
      tipo: "nota",
      conteudo: newNote.trim(),
      autor: "Você",
      createdAt: "Agora mesmo",
    };
    setTimeline([entry, ...timeline]);
    setNewNote("");
  };

  return (
    <div className="space-y-6">
      {/* GRAVADOR DE NOTA DE VOZ (MICROFONE) */}
      <div className="bg-[#0F1624] border border-[#1C2537] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-connect-blue" />
            Gravar Nota de Voz para o Prontuário
          </span>
          {isRecording && (
            <span className="text-xs text-red-400 font-mono font-bold flex items-center gap-1 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              Gravando: {recordingDuration}s
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-connect-blue hover:bg-[#0D478F] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Mic className="w-4 h-4" />
              Iniciar Gravação de Áudio
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all animate-pulse"
            >
              <Square className="w-4 h-4" />
              Concluir e Salvar Áudio
            </button>
          )}
        </div>
      </div>

      {/* INSERÇÃO DE NOTAS DE TEXTO */}
      <div className="bg-[#0F1624] border border-[#1C2537] rounded-2xl p-4 space-y-3">
        <textarea
          placeholder="Escreva um resumo do atendimento, proposta negociada ou alinhamento..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full bg-[#080C14] border border-[#1F2937] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-connect-blue resize-none h-20"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAddNote}
            className="bg-[#1266C7] hover:bg-[#0D478F] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Registrar na Linha do Tempo
          </button>
        </div>
      </div>

      {/* HISTÓRICO CRONOLÓGICO */}
      <div className="space-y-3">
        {timeline.map((entry) => (
          <div key={entry.id} className="p-3.5 bg-[#0F1624] border border-[#1C2537] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-white flex items-center gap-1.5">
                {entry.tipo === "audio" ? (
                  <Mic className="w-3.5 h-3.5 text-connect-blue" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                )}
                {entry.autor}
              </span>
              <span className="text-slate-500 font-mono text-[10px]">{entry.createdAt}</span>
            </div>

            <p className="text-xs text-slate-300">{entry.conteudo}</p>

            {entry.audioUrl && (
              <div className="pt-2">
                <audio controls src={entry.audioUrl} className="w-full h-8" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
