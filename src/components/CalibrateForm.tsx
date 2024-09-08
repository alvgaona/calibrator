import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  dataset: z.string({ required_error: 'A name is required for the dataset' }),
  file: z.custom((value) => {
    if (!(value instanceof FileList) || value.length === 0) {
      return false;
    }

    const file = value[0];
    return (
      file.type === 'application/x-gzip' || file.type === 'application/gzip'
    );
  }, 'Please upload a tar.gz file'),
});

type FormValues = z.infer<typeof formSchema>;

const CalibrateForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function getPresignedUrl(
    runId: string,
    dataset: string,
    fileName: string,
  ): Promise<string> {
    const response = await fetch(import.meta.env.PUBLIC_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        runId,
        dataset,
        fileName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.presignedUrl;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const file = (values.file as FileList)[0];

    const presignedUrl = await getPresignedUrl(
      uuidv4(),
      values.dataset,
      file.name,
    );

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'application/gzip',
      },
    });

    if (!uploadResponse.ok) {
      toast.error(
        `Upload failed. Please retry in a couple minutes or contact support.`,
      );
    }

    toast.success(`File ${file.name} was uploaded succesfully`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dataset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dataset name</FormLabel>
              <FormControl>
                <Input placeholder="steepest descent" {...field} />
              </FormControl>
              <FormDescription>
                This name will be used to create your input dataset
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".tar.gz"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              </FormControl>
              <FormDescription>
                Upload a tar.gz with your images
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export { CalibrateForm };
