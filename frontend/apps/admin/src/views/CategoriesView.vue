<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { Category } from "@blog/shared-types";
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCmsStore } from "../stores/cms";
import { getApiErrorMessage } from "../services/api";

const cmsStore = useCmsStore();
const dialogVisible = ref(false);
const submitting = ref(false);
const editingCategoryId = ref<string>();
const form = reactive({
  name: "",
  description: "",
});

const isEditingCategory = computed(() => Boolean(editingCategoryId.value));
const dialogTitle = computed(() =>
  isEditingCategory.value ? "编辑分类" : "新增分类",
);
const dialogDescription = computed(() =>
  isEditingCategory.value
    ? "更新分类名称或说明后，会同步影响后台引用这个分类的内容结构。"
    : "建议名称简洁稳定，描述可以作为后台识别和协作说明。",
);
const submitButtonLabel = computed(() =>
  isEditingCategory.value ? "保存修改" : "保存分类",
);

const resetForm = () => {
  form.name = "";
  form.description = "";
  editingCategoryId.value = undefined;
};

const closeDialog = () => {
  dialogVisible.value = false;
  resetForm();
};

const openCreateDialog = () => {
  resetForm();
  dialogVisible.value = true;
};

const openEditDialog = (category: Category) => {
  editingCategoryId.value = category.id;
  form.name = category.name;
  form.description = category.description ?? "";
  dialogVisible.value = true;
};

const submitCategory = async () => {
  if (!form.name.trim()) {
    ElMessage.warning("请先填写分类名称。");
    return;
  }

  submitting.value = true;

  try {
    if (editingCategoryId.value) {
      await cmsStore.updateCategory({
        id: editingCategoryId.value,
        name: form.name.trim(),
        description: form.description.trim(),
      });
      ElMessage.success("分类已更新。");
    } else {
      await cmsStore.addCategory(form.name.trim(), form.description.trim());
      ElMessage.success("分类已同步到后端。");
    }

    resetForm();
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error));
  } finally {
    submitting.value = false;
  }
};

const removeCategory = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      "删除分类前请确保没有文章仍在使用它，否则后端会拒绝删除。",
      "删除分类",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
      },
    );

    await cmsStore.deleteCategory(id);
    ElMessage.success("分类已删除。");
  } catch (error) {
    if (error === "cancel" || error === "close") {
      return;
    }

    ElMessage.error(getApiErrorMessage(error));
  }
};

onMounted(async () => {
  try {
    await cmsStore.fetchCategories();
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error));
  }
});
</script>

<template>
  <div class="content-stack">
    <div class="categories-layout">
      <section class="panel-card">
        <div class="section-header">
          <div>
            <span class="page-kicker">Category Shelf</span>
            <h3>现有分类</h3>
            <p>当前共 {{ cmsStore.categories.length }} 个分类。</p>
          </div>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><CirclePlus /></el-icon>
            新建分类
          </el-button>
        </div>

        <div class="collection-grid">
          <article
            v-for="category in cmsStore.categories"
            :key="category.id"
            class="panel-card panel-card--nested"
          >
            <div class="cell-stack">
              <h3>{{ category.name }}</h3>
              <p>{{ category.description || "暂无分类说明。" }}</p>
            </div>  4
            <div class="toolbar toolbar--end" style="margin-top: 15px;">
              <div class="icon-action-group">
                <el-button
                  class="icon-action-button icon-action-button--primary"
                  link
                  type="primary"
                  aria-label="编辑分类"
                  @click="openEditDialog(category)"
                >
                  <el-icon class="icon-action-button__icon">
                    <EditPen />
                  </el-icon>
                </el-button>
                <el-button
                  class="icon-action-button icon-action-button--danger"
                  link
                  type="danger"
                  aria-label="删除分类"
                  style="margin-left: 0px;"
                  @click="removeCategory(category.id)"
                >
                  <el-icon class="icon-action-button__icon">
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <el-dialog
      v-model="dialogVisible"
      class="admin-dialog"
      width="min(100%, 42rem)"
      align-center
      destroy-on-close
    >
      <template #header>
        <div class="admin-dialog__header">
          <span class="page-kicker">Structure Builder</span>
          <h3>{{ dialogTitle }}</h3>
          <p>{{ dialogDescription }}</p>
        </div>
      </template>

      <el-form class="admin-form admin-dialog__form" label-position="top">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="例如：前端工程" />
        </el-form-item>

        <el-form-item label="分类说明">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="补充这个分类的定位、范围或协作说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="admin-dialog__footer">
          <el-button @click="closeDialog"> 取消 </el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="submitCategory"
          >
            {{ submitButtonLabel }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
