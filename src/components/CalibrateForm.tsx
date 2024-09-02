import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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

const formSchema = z.object({
  dataset: z.string({ required_error: 'A name is required for the dataset' }),
  file: z.custom((value) => {
    if (!(value instanceof FileList) || value.length === 0) {
      return false;
    }

    const file = value[0];
    return file.type === 'application/x-gzip';
  }, 'Please upload a tar.gz file'),
});

const CalibrateForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
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
                <Input placeholder="steepest-descent" {...field} />
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
