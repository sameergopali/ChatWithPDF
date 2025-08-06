
interface Field {
    type: 'text' | 'number' | 'date' | 'checkbox' | 'label';
}

interface TextField extends Field {
    type: 'text';
    placeholder: string;
}


interface DateField extends Field {
    type: 'date';
    dueDate?: string;
}

interface CheckboxField extends Field {
    type: 'checkbox';
    checked: boolean;
    options: { label: string; value: boolean }[];
}

interface LabelField  extends Field {
    type: 'label';
    text: string;
}


interface Task{
    title: string;
    fields: Field[];
}

interface Column{
    title: string;
    tasks: Task[];
}

interface Board{
    title: string;
    columns: Column[];
}