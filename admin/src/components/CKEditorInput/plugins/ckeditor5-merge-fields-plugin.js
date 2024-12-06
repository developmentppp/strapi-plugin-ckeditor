const DropdownView = window.CKEditor5.ui.DropdownView;
const DropdownButtonView = window.CKEditor5.ui.DropdownButtonView;
const DropdownPanelView = window.CKEditor5.ui.DropdownPanelView;
const ListView = window.CKEditor5.ui.ListView;
const ListItemView = window.CKEditor5.ui.ListItemView;
const View = window.CKEditor5.ui.View;
const ButtonView = window.CKEditor5.ui.ButtonView;
import axios from "axios";

export default class MergeFields {
    constructor(editor) {
        this.editor = editor;
    }

    init() {

        const editor = this.editor;
        const queryParams = new URLSearchParams(window.top?.location?.search || window.location.search); // get QueryParams from top or window
        const token = queryParams.has("access_token") ? queryParams.get("access_token") : "";

        const items = axios.get("/kosme-admin/kosme-clinic-backend/kos-placeholder", {
            headers: {Authorization: `Bearer ${token}`}
        }).then(res =>{
            if (res.status === 200 && res?.data) {
                const items = res.data?.data?.payload
                return items
            }else {
                return []
            }
        })


        // Add dropdown button to the toolbar
        editor.ui.componentFactory.add('mergeFields', (locale) => {
          
       
            const listView = new ListView(locale);

            // Dropdown button on which a click will open the dropdown list
            const dropdownButton = new DropdownButtonView(locale);
            // Dropdown button configuration
            dropdownButton.set({
                label: '$ Sonderfeld',
                withText: true,
                tooltip: true,
            });

            // Dropdown button style
            dropdownButton.extendTemplate({
                attributes:{
                    style: `
                    display:flex;
                    justify-content:space-around;
                    `
                }
            })


            // The dropdown list container
            const dropdownPanel = new DropdownPanelView(locale);

            // Style the dropdown panel
            dropdownPanel.extendTemplate({
                attributes: {
                    style: `
                        background-color: white;
                        border: 1px solid #ddd;
                        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                        padding: 10px;
                        overflow-y: auto;
                        overflow-x: hidden;
                        width: 400px;
                        max-height:300px;
                    `
                }
            });


            // Dropdown list items 
            items.then(placeholders => {
                placeholders.forEach((tableEntry) => {
                    // Container which contains the Dropdown list items group header
                    const categoryHeader = new ListItemView(locale);

                    // Dropdown list items group header (z.B E-Mail)
                    const headerView = new View(locale);
    
                    // Dropdown list items group header style
                    headerView.setTemplate({
                        tag: 'div',
                        attributes: {
                            style: `
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                font-size: 14px;
                                font-weight: bold;
                                padding: 5px;
                                background-color: #f5f5f5;
                                border-bottom: 1px solid #ddd;
                                margin-bottom: 5px;
                                cursor: pointer;
                            `
                        },
                        children: [
                            {
                                tag: 'span',
                                children: [{ text: tableEntry.text }]
                            },
                            {
                                tag: 'span',
                                attributes: {
                                    style: `
                                        font-size: 12px;
                                        margin-left: auto;
                                    `
                                },
                                children: [{ text: '▶' }] 
                            }
                        ]
                    });
                    
    
                    // Append the header to its container 
                    categoryHeader.children.add(headerView);

                    // Append the header's container to the lis items  
                    listView.items.add(categoryHeader);
    
                    // Container contains the list of items which belongs to a certain header 
                    // z.B Inhalt, fußzeil rendered under E-Mail
                    const childContainer = new View(locale);

                    childContainer.setTemplate({
                        tag: 'div',
                        attributes: {
                            style: `
                                display: none; /* Initially hidden */
                            `
                        }
                    });
    
                    // Render the child container explicitly
                    childContainer.render();
    
                    // The list of items which has been rendered under each header 
                    // z.B Inhalt, fußzeil rendered under E-Mail
                    tableEntry.columns.forEach((column) => {
                        // The container which contains each item 
                        const listItem = new ListItemView(locale);

                        // Each button holds the label of each item
                        const buttonView = new ButtonView(locale);
                    
                        buttonView.set({
                            label: column.text,
                            withText: true
                        });
    
                        buttonView.render();

                        // Append button to it container
                        childContainer.element.appendChild(buttonView.element);
                        
                         // Handle the placeholder insertion on click
                         buttonView.on('execute', () => {
                            editor.model.change((writer) => {
                                const insertText = writer.createText(column.column);
                                editor.model.insertContent(insertText);
                                dropdown.isOpen = false; // Close the dropdown
                        
                                // Clear the search query
                                const searchInput = searchBox.element.querySelector('input');
                                if (searchInput) {
                                    searchInput.value = ''; 
                                }
                        
                                // Reset the display of all buttons
                                const allButtons = listView.element.querySelectorAll('button');
                                allButtons.forEach((button) => {
                                    button.style.display = ''; 
                                });
                            });
                        });

                        // Render listItem explicitly to access its `element`
                        listItem.render(); 
    
                        if (childContainer.element) {
                            childContainer.element.appendChild(listItem.element);
                        } else {
                            console.error("Child container element is null!");
                        }
                    });
           
                    listView.items.add(childContainer);
    
                    const arrowElement = headerView.element.querySelector("span:last-child")
                    const headerElement = headerView.element

                    
                    // Arrow toggle functionality
                    headerElement.addEventListener('click', () => {
                        
                        if (childContainer.element) {
    
                            const isVisible = childContainer.element.style.display === 'block';
    
                            // Toggle visibility
                            childContainer.element.style.display = isVisible ? 'none' : 'block';                         
                            
                            // Update arrow direction
                            arrowElement.textContent = isVisible ? '▶' : '▼';
                        } else {
                            console.error("Child container element is null during toggle!");
                        }
                    });
    
                });
            })

            // Search functionality
            const searchBox = new View(locale);
            searchBox.setTemplate({
                tag: 'fieldset',
                attributes: {
                    style: `
                        border: none;
                        padding: 5px 0;
                        margin: 0;
                    `
                },
                children: [
                    {
                        tag: 'input',
                        attributes: {
                            type: 'text',
                            placeholder: 'Suche...',
                            style: `
                                width: 98%;
                                padding: 8px 32px 8px 10px;
                                font-size: 14px;
                                margin: 10px 3px 0 3px;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                box-sizing: border-box;
                                outline: none;
                                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23999" viewBox="0 0 24 24" width="16" height="16"><path d="M9.5 3a6.5 6.5 0 015.2 10.6l4.7 4.7a1 1 0 01-1.4 1.4l-4.7-4.7A6.5 6.5 0 119.5 3zm0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"/></svg>') no-repeat;
                                background-size: 16px;
                                background-position: right 10px center;
                            `
                        }
                    }
                ]
            });

            searchBox.render();
            dropdownPanel.children.add(searchBox);

            // Attach list view to the dropdown
            dropdownPanel.children.add(listView);

            const dropdown = new DropdownView(locale, dropdownButton, dropdownPanel);

            // Filter items based on search query
            const inputElement = searchBox.element.querySelector('input');
                     
            inputElement.addEventListener('keyup', (event) => {
                const query = event.target.value.toLowerCase();
            
                items.then((placeholders) => 
                    placeholders.forEach((placeholder) => {
                    const buttonContainer = listView.items.find((item) => {
                        const headerTextElement = item.element.querySelector('div > span');
                        return headerTextElement && headerTextElement.innerText.includes(placeholder.text);
                    })?.element.nextElementSibling;
                    
                        const buttons = buttonContainer.querySelectorAll("button")
                        if (buttons && buttons.length > 0) {
                            buttons.forEach((button) => {
                                const label = button.querySelector("span")?.innerText?.toLowerCase()
                                if (query === '') {
                                    button.style.display = '';
                                } else {
                                    const matchesQuery = label.includes(query);
                                    button.style.display = matchesQuery ? '' : 'none';
                                }
                            })
                            
                        }
                    })
               )
            });
            
            return dropdown;
        });
    }
}
