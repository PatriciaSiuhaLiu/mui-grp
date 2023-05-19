import React, { Component } from 'react'
import {
    Button,
    ComposedModal,
    Form,
    ModalBody,
    ModalFooter,
    TextInput,
  } from "carbon-components-react";

export default class DeleteRuleModal extends Component {
    closeModal () {
        this.props.onDeleteCancel();
    }
    render() {
        return (
            <ComposedModal open={this.props.isModalOpen} onClose={() => this.props.onDeleteCancel()}>
                <ModalBody className="my-2 py-2" hasScrollingContent={true}>
                    <p className="" >
                    Are you sure you want to delete this Rule ?
                    </p>
                </ModalBody>
                <ModalFooter secondaryButtonText="Cancel">
                    <Button kind="danger" onClick={() => this.props.onDeleteConfrim()}>
                        Delete
                    </Button>
                </ModalFooter>
      </ComposedModal>
        )
    }
}
