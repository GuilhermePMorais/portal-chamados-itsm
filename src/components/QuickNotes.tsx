import React, { useState } from 'react';
import { 
  Plus, 
  Pin, 
  Trash2, 
  Edit3, 
  Search, 
  StickyNote as NoteIcon,
  Check,
  Sparkles
} from 'lucide-react';
import { QuickNote, User } from '../types';

interface QuickNotesProps {
  notes: QuickNote[];
  currentUser: User | null;
  onSaveNote: (note: Partial<QuickNote>) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

const COLOR_MAP = {
  yellow: {
    bg: 'bg-amber-100/90 border-amber-300/80 text-amber-950',
    badge: 'bg-amber-200 text-amber-900',
    picker: 'bg-amber-200 border-amber-400',
  },
  green: {
    bg: 'bg-emerald-100/90 border-emerald-300/80 text-emerald-950',
    badge: 'bg-emerald-200 text-emerald-900',
    picker: 'bg-emerald-200 border-emerald-400',
  },
  blue: {
    bg: 'bg-sky-100/90 border-sky-300/80 text-sky-950',
    badge: 'bg-sky-200 text-sky-900',
    picker: 'bg-sky-200 border-sky-400',
  },
  purple: {
    bg: 'bg-purple-100/90 border-purple-300/80 text-purple-950',
    badge: 'bg-purple-200 text-purple-900',
    picker: 'bg-purple-200 border-purple-400',
  },
  rose: {
    bg: 'bg-rose-100/90 border-rose-300/80 text-rose-950',
    badge: 'bg-rose-200 text-rose-900',
    picker: 'bg-rose-200 border-rose-400',
  },
};

export const QuickNotes: React.FC<QuickNotesProps> = ({
  notes,
  currentUser,
  onSaveNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<QuickNote['color']>('yellow');

  const handleStartCreate = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteColor('yellow');
    setIsCreating(true);
    setEditingNote(null);
  };

  const handleStartEdit = (note: QuickNote) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setEditingNote(note);
    setIsCreating(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    onSaveNote({
      id: editingNote ? editingNote.id : undefined,
      title: noteTitle.trim() || 'Lembrete',
      content: noteContent.trim(),
      color: noteColor,
      pinned: editingNote ? editingNote.pinned : false,
    });

    setIsCreating(false);
    setEditingNote(null);
  };

  const filtered = notes.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.authorName.toLowerCase().includes(q)
    );
  });

  // Ordenar notas: fixadas primeiro
  const sortedNotes = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div id="quick-notes-view" className="space-y-5 pb-12">
      {/* Topo: Busca & Botão Nova Nota */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="search-notes-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar lembretes e notas adesivas..."
            className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          id="btn-new-note"
          onClick={handleStartCreate}
          className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 touch-manipulation shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lembrete Adesivo</span>
        </button>
      </div>

      {/* Modal/Formulário de Criar/Editar Nota */}
      {isCreating && (
        <div 
          id="note-form-modal"
          className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-lg space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <NoteIcon className="w-4 h-4 text-blue-600" />
              {editingNote ? 'Editar Nota' : 'Nova Nota Adesiva'}
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-500 hover:text-slate-800 p-1"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                id="input-note-title"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Título do lembrete (ex: Janela de manutenção)"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <textarea
                id="input-note-content"
                rows={3}
                required
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Conteúdo do recado ou anotação rápida de TI..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Escolha da Cor do Adesivo */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Cor:</span>
                {(['yellow', 'green', 'blue', 'purple', 'rose'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    id={`btn-color-${c}`}
                    onClick={() => setNoteColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 flex items-center justify-center ${
                      COLOR_MAP[c].picker
                    } ${noteColor === c ? 'ring-2 ring-blue-600 scale-110' : 'opacity-80'}`}
                  >
                    {noteColor === c && <Check className="w-4 h-4 text-slate-800" />}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                id="btn-save-note"
                className="min-h-[42px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm active:scale-95 touch-manipulation cursor-pointer"
              >
                {editingNote ? 'Salvar Alterações' : 'Criar Lembrete'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Notas Adesivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => {
            const colors = COLOR_MAP[note.color] || COLOR_MAP.yellow;
            return (
              <div
                key={note.id}
                id={`sticky-note-${note.id}`}
                className={`p-4 rounded-2xl border shadow-sm transition-all duration-150 flex flex-col justify-between min-h-[190px] relative group hover:shadow-md ${
                  colors.bg
                } ${note.pinned ? 'ring-2 ring-emerald-500/50' : ''}`}
              >
                {/* Cabeçalho da Nota */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-extrabold text-sm leading-snug break-words flex-1">
                      {note.title}
                    </h4>

                    <button
                      id={`btn-pin-note-${note.id}`}
                      onClick={() => onTogglePin(note.id)}
                      title={note.pinned ? 'Desafixar nota' : 'Fixar no topo'}
                      aria-label="Fixar ou desafixar nota"
                      className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-transform active:scale-90 touch-manipulation ${
                        note.pinned
                          ? 'bg-[#121820] text-emerald-400 shadow-sm'
                          : 'text-slate-500 hover:bg-black/5'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'rotate-45' : ''}`} />
                    </button>
                  </div>

                  {/* Conteúdo */}
                  <p className="text-xs leading-relaxed whitespace-pre-wrap break-words opacity-90">
                    {note.content}
                  </p>
                </div>

                {/* Rodapé da Nota */}
                <div className="pt-3 mt-3 border-t border-black/10 flex items-center justify-between text-[11px] opacity-80">
                  <span className="font-medium truncate max-w-[120px]">
                    {note.authorName}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-edit-note-${note.id}`}
                      onClick={() => handleStartEdit(note)}
                      title="Editar anotação"
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-black/5 active:scale-95 touch-manipulation"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-delete-note-${note.id}`}
                      onClick={() => {
                        if (window.confirm('Excluir este lembrete?')) {
                          onDeleteNote(note.id);
                        }
                      }}
                      title="Excluir anotação"
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-rose-700 hover:bg-rose-500/10 active:scale-95 touch-manipulation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <NoteIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">Nenhum lembrete registrado</p>
            <p className="text-xs text-slate-400 mt-0.5">Clique em "Novo Lembrete Adesivo" para adicionar lembretes visuais.</p>
          </div>
        )}
      </div>
    </div>
  );
};
