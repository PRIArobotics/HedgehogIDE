// @flow

import * as React from 'react';
import { defineMessages, FormattedMessage as M } from 'react-intl';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const messages = defineMessages({
  ok: {
    id: 'app.dialog.ok',
    description: 'text for the OK button in dialogs',
    defaultMessage: 'OK',
  },
  cancel: {
    id: 'app.dialog.cancel',
    description: 'text for the Cancel button in dialogs',
    defaultMessage: 'Cancel',
  },
});

type ActionConstant =
  | 'OK_CANCEL'
  | 'OK_autofocus_CANCEL'
  | 'OK_CANCEL_autofocus';

type SimpleDialogProps = {|
  id: string,
  open: boolean,
  valid: boolean,
  title?: React.Node,
  description?: React.Node,
  actions: ActionConstant | React.Node,
  onCancel?: () => void | Promise<void>,
  onConfirm?: () => void | Promise<void>,
  children?: React.Node,
|};

function SimpleDialog({
  id,
  open,
  valid,
  title,
  description,
  actions,
  onCancel,
  onConfirm,
  children,
}: SimpleDialogProps) {
  const conditionalProps = {};
  if (title !== undefined) conditionalProps['aria-labelledby'] = `${id}-title`;
  if (description !== undefined)
    conditionalProps['aria-describedby'] = `${id}-description`;

  let actionsNode: React.Node;
  switch (actions) {
    case 'OK_CANCEL':
    case 'OK_autofocus_CANCEL':
    case 'OK_CANCEL_autofocus':
      actionsNode = (
        <>
          <Button
            onClick={onCancel}
            color="secondary"
            autoFocus={actions === 'OK_CANCEL_autofocus'}
          >
            <M {...messages.cancel} />
          </Button>
          <Button
            type="submit"
            color="primary"
            disabled={!valid}
            autoFocus={actions === 'OK_autofocus_CANCEL'}
          >
            <M {...messages.ok} />
          </Button>
        </>
      );
      break;
    default:
      actionsNode = actions;
  }

  const handleSubmit = event => {
    if (onConfirm !== undefined) onConfirm();
    event.preventDefault();
  };

  return (
    <Dialog open={open} onClose={onCancel} {...conditionalProps}>
      <form onSubmit={handleSubmit}>
        {title !== undefined ? (
          <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
        ) : null}
        <DialogContent>
          {description !== undefined ? (
            <DialogContentText id={`${id}-description`}>
              {description}
            </DialogContentText>
          ) : null}
          {children}
        </DialogContent>
        <DialogActions>{actionsNode}</DialogActions>
      </form>
    </Dialog>
  );
}

export default SimpleDialog;
