/**
 * @author Jörn Kreutel
 */
import {mwf} from "../Main.js";
import {entities} from "../Main.js";
//import {GenericCRUDImplLocal} from "../Main.js";

export default class ListviewViewController extends mwf.ViewController {

    constructor() {
        super();

        console.log("ListviewViewController()");

        this.items = [
            new
            entities.MediaItem("m1","https://placekitten.com/100/100"),
            new
            entities.MediaItem("m2","https://placekitten.com/200/150"),
            new
            entities.MediaItem("m3","https://placekitten.com/150/200")
        ];
        this.addNewMediaItemElement = null;

        //this.crudops =
        //    GenericCRUDImplLocal.newInstance("MediaItem");
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("root is:", this.root);
        this.initialiseListview(this.items);
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.addNewMediaItemElement.onclick = (() => {
            this.createNewItem();
        });

        this.addListener(new mwf.EventMatcher("crud","created","MediaItem"),((event) => {
            this.addToListview(event.data);
        }));
        this.addListener(new mwf.EventMatcher("crud","updated","MediaItem"),((event) => {
            this.updateInListview(event.data._id,event.data);
        }));
        this.addListener(new mwf.EventMatcher("crud","deleted","MediaItem"),((event) => {
                this.removeFromListview(event.data);
        }));


        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });

        // call the superclass once creation is done
        super.oncreate();
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates

    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
        itemview.root.getElementsByTagName("img")[0].src = itemobj.src;
        itemview.root.getElementsByTagName("h2")[0].textContent = itemobj.title + itemobj._id;
        itemview.root.getElementsByTagName("h3")[0].textContent = itemobj.added;
    }
    */

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction

    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
        this.nextView("mediaReadview",{item: itemobj});
    }
    */

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
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
        if (nextviewid == "mediaReadview" && returnValue &&
            returnValue.deletedItem) {
            this.removeFromListview(returnValue.deletedItem._id);
        }
    }

    createNewItem() {
        var newItem = new
        entities.MediaItem("","https://placekitten.com/100/100");
        this.showDialog("mediaItemDialog",{
            item: newItem,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    newItem.create().then(() => {
                        //this.addToListview(newItem);
                    });
                    this.hideDialog();
                })
            }
        });
    }

    deleteItem(item) {
        this.showDialog("deleteItemDialog",{
            item: this.item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.delete(() => {
                        //this.removeFromListview(item._id);
                    });
                    this.hideDialog();
                }),
                resetItem: ((event) => {
                    this.markAsObsolete();
                    this.hideDialog();
                })

            }
        });
        /*this.crudops.delete(item._id).then(() => {
            this.removeFromListview(item._id);
        });*/

    }
    editItem(item) {
        item.title = (item.title);
        /*this.crudops.update(item._id,item).then(() => {
            this.updateInListview(item._id,item);
        });*/
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        //this.updateInListview(item._id,item);
                    });
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    //this.hideDialog();
                })
            }
        });
    }
}

