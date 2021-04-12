class QTree {

    /**
     * Массив географических объектов
     *
     * @var {?Array} items
     * @var {Number} items[].x
     * @var {Number} items[].y
     * @var {*} items[].obj
     */
    items = [];

    /**
     * Массив поддеревьев
     * @var {?QTree[]} children
     */
    children = null;

    /**
     * Создаёт quad-дерево
     *
     * @param {Object} config
     * @param {int} config.w           Ширина карты в метрах
     * @param {int} config.h           Высота карты в метрах
     * @param {int} config.maxItems    Максимальное количество географических объектов в узле
     * @param {int} config.maxDepth    Максимальная глубина дерева
     */
    constructor({w, h, maxItems, maxDepth}) {
        this.halfW = w / 2;
        this.halfH = h / 2;
        this.maxItems = maxItems;
        this.maxDepth = maxDepth;
    }

    /**
     * Добавляет объект в координаты x,y
     *
     * @param {int} x   Абсцисса объекта в метрах
     * @param {int} y   Ордината объекта в метрах
     * @param {*} obj   Добавляемый объект
     */
    add(x, y, obj) {
        // Если у текущего узла есть дочерние узлы
        if (this.children) {
            // Получаем индекс квадранта:
            //
            //   x < w/2 | x >= w/2
            // +---------+---------+
            // |         |         |
            // |    0    |    1    | y < h/2
            // |         |         |
            // +---------+---------+
            // |         |         |
            // |    2    |    3    | y >= h/2
            // |         |         |
            // +---------+---------+
            //
            const idx = (y >= this.halfH) * 2 + (x >= this.halfW);

            // Получаем координаты точки в этом квадранте:
            x = x % this.halfW;
            y = y % this.halfH;

            // Добавляем объект в соответствующий дочерний узел с новыми координатами
            this.children[idx].add(x, y, obj);
            return;
        }

        // Если у текущего узла нет подузлов, но либо достигнута максимальная глубина
        // дерева, либо узел ещё не заполнился
        if (this.maxDepth == 0 || this.items.length < this.maxItems) {
            // Добавляем объект в данные текущего узла
            this.items.push({x, y, obj});
            return;
        }

        // Если же узел заполнился и максимальная глубина ещё не достигнута, то
        // Создаём массив дочерних узлов
        this.children = [];
        // Наполняем этот массив
        for (let i = 0; i < 4; ++i) {
            // Создаём quad-дерево
            this.children[i] = new QTree({
                w: this.halfW,                  // Ширина дочернего узла равна половине ширины текущего
                h: this.halfH,                  // Высота дочернего узла равна половине высоты текущего
                maxItems: this.maxItems,        // Максимальное количество объектов такое же
                maxDepth: this.maxDepth - 1     // А допустимая глубина меньше на единицу
            });
        }
        // Раскидываем объекты по дочерним узлам
        for (let {x, y, obj} of this.items) {
            this.add(x, y , obj);
        }
        this.items = null;
    }

    /**
     * Возвращает узел, имеющий указанный путь от корня
     *
     * @param {string} path
     *
     * @returns {QTree}
     */
    getSubtree(path) {
        if(!path || !this.children) {
            return this;
        }
        const idx = path[0];
        return this.children[idx].getSubtree(path.substring(1));
    }

    /**
     * Возвращает объекты, сохранённые в данном узле или в его подузлах
     *
     * @returns {*[]}
     */
    get() {
        const result = [];

        function gatherRecursive (quad, result) {
            if (!quad.children) {
                for (let {obj} of quad.items) {
                    result.push(obj);
                }
            } else {
                for (let i = 0; i < 4; ++i) {
                    gatherRecursive(quad.children[i], result);
                }
            }
            return result;
        }
        gatherRecursive(this, result);

        return result;
    }

}