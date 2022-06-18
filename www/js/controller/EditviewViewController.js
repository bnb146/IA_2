/**
 * @author Jörn Kreutel
 */
import {mwf} from "../Main.js";
import {entities} from "../Main.js";

export default class EditviewViewController extends mwf.ViewController {

    constructor() {
        super();

        console.log("EditviewViewController()");
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        const myItem = this.args.item
        //this.bindElement("mediaEditviewTemplate", {item: myItem}, this.root);

        this.viewProxy =
            this.bindElement("mediaEditviewTemplate",{item: myItem},this.root).viewProxy;
        this.viewProxy.bindAction("deleteItem",(() => {
            myItem.delete().then(() => {
                this.notifyListeners(new
                mwf.Event("crud","deleted","MediaItem",myItem._id));
                this.previousView();
            })
        }));

        this.viewProxy.bindAction("defaultUrl", (() => {
            mediaEditviewForm.src.value = "https://placekitten.com/200/200"
        }));

        const mediaEditviewForm = this.root.getElementsByTagName("form")[0];
        const srcfileInputElement = mediaEditviewForm.srcfile;

        srcfileInputElement.onchange = () => {
           if(srcfileInputElement.files.length) {
               const srcfileReference = srcfileInputElement.files[0];
               const srcfileUrl = URL.createObjectURL(srcfileReference);
               myItem.src = srcfileUrl;

               mediaEditviewForm.src.value = srcfileUrl;

               const imgPreview =this.root.querySelector("img");
               imgPreview.src = srcfileUrl;
           }
        }

        mediaEditviewForm.onsubmit = () => {
            if(srcfileInputElement.files[0]) {
                this.uploadWithHttpRequest(srcfileInputElement, myItem);
            }
            else {
                this.updateOrCreateMediaItem(myItem);
            }
            return false;
        }


        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * use http-request to upload user generated content
     */
    uploadWithHttpRequest(srcfileInputElement, myItem) {
        const srcfileReference = srcfileInputElement.files[0];

        const uploadXhr = new XMLHttpRequest();
        uploadXhr.open("POST", "api/upload");
        uploadXhr.onreadystatechange = () => {
            if(uploadXhr.readyState == 4) {
                if(uploadXhr.status == 200) {
                    const responseText = uploadXhr.responseText;
                    const responseJsonObj = JSON.parse(responseText);
                    const uploadSrcfileUrl = responseJsonObj.data.srcfile;
                    myItem.src = uploadSrcfileUrl;
                    this.updateOrCreateMediaItem(myItem);
                }
                else {
                    alert("Error submitting data to server: " + uploadXhr.status);
                }
            }
        }
        const uploadBody = new FormData();
        uploadBody.append("srcfile", srcfileReference)
        uploadXhr.send(uploadBody);
    }

    /*
     *for formula submit: update or create new MediaItem and return to previous view
     */
    updateOrCreateMediaItem(myItem) {
        if (myItem.created) {
            myItem.update().then(() => {
                this.previousView({updatedItem: myItem});
            });
        } else {
            myItem.create().then(() => {
                this.previousView({createdItem: myItem});
            });
        }
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    }

}

