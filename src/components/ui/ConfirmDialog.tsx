import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onClose, danger = false }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-ink-700 text-sm">{message}</p>
      <div className="mt-6 flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button className={danger ? "btn-danger" : "btn-primary"} onClick={() => { onConfirm(); onClose(); }}>
          Confirmar
        </button>
      </div>
    </Modal>
  );
}
