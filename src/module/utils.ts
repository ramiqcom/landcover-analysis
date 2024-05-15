import { Dispatch, MutableRefObject, SetStateAction } from 'react';

/**
 * Function to show modal
 */
export function setModal(
  text: string,
  modalRef: MutableRefObject<any>,
  setModalText: Dispatch<SetStateAction<string>>,
  show: boolean = true,
  clickToClose: boolean = false
): void {
	const modal = modalRef.current;
	
  setModalText(text);

  if (show) {
    modal.showModal();
  } else {
    modal.close();
  }

  if (clickToClose) {
    modal.onclick = (e: Event): void => modal.close();
  } else {
    modal.onclick = (e: Event): void => null;
  }
}
